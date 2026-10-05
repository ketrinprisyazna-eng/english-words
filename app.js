/* ============ Английские слова — приложение для повторения ============ */
/* Прогресс хранится в localStorage этого браузера и (если войти) синхронизируется через Firebase. */
/* Все ключи localStorage начинаются с enapp_, чтобы не пересекаться с испанским приложением
   (на GitHub Pages оба сайта живут на одном домене и делят localStorage). */

const LS_PROGRESS = "enapp_progress_v1";
const LS_HISTORY  = "enapp_history_v1";
const LS_STREAK   = "enapp_streak_v1";

const INTERVALS_DAYS = [0, 1, 3, 7, 14, 30]; // box 0..5

/* ---------- утилиты ---------- */
function pad(n) { return n < 10 ? "0" + n : "" + n; }
function todayStr() {
  const d = new Date();
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}
function daysAgoStr(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}
function normKey(en) { return en.trim().toLowerCase(); }
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}
function saveJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
}

/* ---------- прогресс по словам ---------- */
let PROGRESS = loadJSON(LS_PROGRESS, {});
let HISTORY = loadJSON(LS_HISTORY, {});
let STREAK = loadJSON(LS_STREAK, { streak: 0, lastDate: null });

function getProgress(en) {
  const k = normKey(en);
  if (!PROGRESS[k]) {
    PROGRESS[k] = { box: 0, next: 0, total: 0, correct: 0, fails: 0, difficult: false, customAssoc: "", lastSeen: null, lastWrong: false };
  }
  if (PROGRESS[k].lastWrong === undefined) PROGRESS[k].lastWrong = false;
  return PROGRESS[k];
}
function dateStrOf(ts) {
  const d = new Date(ts);
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}
function seenToday(p) { return p.lastSeen && dateStrOf(p.lastSeen) === todayStr(); }
function saveProgress() { saveJSON(LS_PROGRESS, PROGRESS); if (window.CloudSync) window.CloudSync.schedulePush(); }
function saveHistory() { saveJSON(LS_HISTORY, HISTORY); if (window.CloudSync) window.CloudSync.schedulePush(); }
function saveStreak() { saveJSON(LS_STREAK, STREAK); if (window.CloudSync) window.CloudSync.schedulePush(); }

function touchStreak() {
  const t = todayStr();
  if (STREAK.lastDate === t) return;
  const y = daysAgoStr(1);
  if (STREAK.lastDate === y) STREAK.streak += 1;
  else STREAK.streak = 1;
  STREAK.lastDate = t;
  saveStreak();
}

function registerReview(en, correct) {
  const t = todayStr();
  if (!HISTORY[t]) HISTORY[t] = { reviewed: 0, correct: 0 };
  HISTORY[t].reviewed += 1;
  if (correct) HISTORY[t].correct += 1;
  saveHistory();
  touchStreak();

  const p = getProgress(en);
  p.total += 1;
  p.lastSeen = Date.now();
  p.lastWrong = !correct; // ошибка — слово идёт первым в следующий раз, пока не ответят верно
  if (correct) {
    p.correct += 1;
    p.box = Math.min(5, p.box + 1);
    p.fails = Math.max(0, p.fails - 1);
    if (p.box >= 2) p.difficult = false;
    p.next = Date.now() + INTERVALS_DAYS[p.box] * 86400000;
  } else {
    p.box = Math.max(0, p.box - 1);
    p.fails += 1;
    if (p.fails >= 3) p.difficult = true;
    // ошибка — слово возвращается в повторение не раньше следующего дня, а не сразу в новой сессии
    p.next = Date.now() + Math.max(1, INTERVALS_DAYS[p.box]) * 86400000;
  }
  saveProgress();
}

function markDifficult(en) {
  const p = getProgress(en);
  p.difficult = true;
  p.fails = Math.max(p.fails, 3);
  saveProgress();
}

function isDue(p, now) { return !p.next || p.next <= now; }

function countDue() {
  const now = Date.now();
  let c = 0;
  for (const w of WORDS_DATA) if (isDue(getProgress(w.en), now)) c++;
  return c;
}
function countMastered() {
  let c = 0;
  for (const w of WORDS_DATA) if (getProgress(w.en).box >= 4) c++;
  return c;
}
function countLearning() {
  let c = 0;
  for (const w of WORDS_DATA) { const b = getProgress(w.en).box; if (b >= 1 && b < 4) c++; }
  return c;
}
function countDifficult() {
  let c = 0;
  for (const w of WORDS_DATA) if (getProgress(w.en).difficult) c++;
  return c;
}

/* ---------- построение очереди сессии ---------- */
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function buildQueue(n) {
  const now = Date.now();
  const sortFn = (a, b) => {
    if (a.p.lastWrong !== b.p.lastWrong) return a.p.lastWrong ? -1 : 1; // ошибки вчера/сегодня — первыми
    const aDue = isDue(a.p, now), bDue = isDue(b.p, now);
    if (aDue !== bDue) return aDue ? -1 : 1;
    if (a.p.difficult !== b.p.difficult) return a.p.difficult ? -1 : 1;
    const aOver = aDue ? now - (a.p.next || 0) : 0;
    const bOver = bDue ? now - (b.p.next || 0) : 0;
    if (aOver !== bOver) return bOver - aOver;
    return a.w.id - b.w.id;
  };

  const all = WORDS_DATA.map((w) => ({ w, p: getProgress(w.en) }));
  // слова, уже пройденные СЕГОДНЯ (правильно или с ошибкой), — не повторяем до следующего дня;
  // ошибки просто переходят в первый план ЗАВТРА (см. sortFn: lastWrong — первыми)
  let pool = all.filter((x) => !seenToday(x.p));
  if (pool.length === 0) pool = all; // если все слова уже пройдены сегодня — не оставлять сессию пустой

  pool.sort(sortFn);
  const selected = pool.slice(0, n);
  // слова с ошибкой всегда идут первыми; внутри каждой группы порядок перемешан
  const mistakes = shuffleArray(selected.filter((x) => x.p.lastWrong));
  const rest = shuffleArray(selected.filter((x) => !x.p.lastWrong));
  return [...mistakes, ...rest].map((x) => x.w);
}

/* ============ Примерное звучание по-русски + автогенерация ассоциаций ============ */
const RHYME_BANK = [
  "кот","нос","рука","стол","боль","сон","лес","дом","вода","хлеб","снег","огонь","стена",
  "звезда","река","гора","море","роза","злой","гром","сыр","мышь","рыба","нога","рог","конь",
  "гусь","ключ","замок","масло","соль","перец","мясо","молоко","чай","кофе","сахар","мёд",
  "лист","ветер","дождь","туча","солнце","луна","песок","камень","трава","цветок","дерево",
  "птица","орёл","волк","лиса","медведь","заяц","слон","тигр","лев","змея","паук","муравей",
  "окно","дверь","стул","диван","лампа","зеркало","полка","ковёр","подушка","одеяло","чашка",
  "тарелка","ложка","вилка","нож","стакан","бутылка","сумка","ключи","часы","телефон","книга",
  "тетрадь","ручка","карандаш","доска","парта","школа","учитель","друг","враг","сосед","гость",
  "танец","песня","игра","смех","слёзы","радость","грусть","страх","злость","любовь","дружба",
  "город","улица","площадь","дорога","мост","башня","парк","сад","поле","берег","остров",
  "поезд","машина","самолёт","корабль","велосипед","автобус","такси","билет","паспорт","чемодан",
  "рынок","магазин","деньги","монета","банк","цена","подарок","праздник","свеча","торт",
  "голова","глаз","ухо","рот","зуб","сердце","живот","спина","палец","плечо",
  "врач","аптека","лекарство","кашель","простуда","укол","бинт","кровь",
  "бар","бал","кит","мак","лук","суп","пар","сок","том","бот","гол","пол","мир","тир",
];

/* Очень приблизительная передача звучания английского слова русскими буквами —
   только как «крючок» для черновой ассоциации, не как правило чтения. */
function transliterateEn(word) {
  let w = word.toLowerCase().replace(/^(to|a|an)\s+/, "");
  const rules = [
    [/tion/g, "шн"], [/sion/g, "жн"], [/ture/g, "чер"], [/igh/g, "ай"], [/ough/g, "аф"],
    [/sh/g, "ш"], [/ch/g, "ч"], [/tch/g, "ч"], [/th/g, "з"], [/ph/g, "ф"], [/ck/g, "к"], [/wh/g, "у"],
    [/kn/g, "н"], [/wr/g, "р"], [/qu/g, "кв"], [/ng\b/g, "нг"],
    [/ee/g, "и"], [/ea/g, "и"], [/oo/g, "у"], [/ou/g, "ау"], [/ow\b/g, "оу"], [/ow/g, "ау"],
    [/ai/g, "эй"], [/ay/g, "эй"], [/oy/g, "ой"], [/oi/g, "ой"], [/ey\b/g, "и"], [/y\b/g, "и"],
    [/a([bcdfgklmnprstvz])e\b/g, "эй$1"], [/i([bcdfgklmnprstvz])e\b/g, "ай$1"], [/o([bcdfgklmnprstvz])e\b/g, "оу$1"],
    [/e\b/g, ""], [/c([eiy])/g, "с$1"], [/c/g, "к"], [/g([ei])/g, "дж$1"], [/j/g, "дж"], [/x/g, "кс"],
    [/y/g, "й"], [/w/g, "у"], [/h/g, "х"], [/q/g, "к"],
    [/b/g, "б"], [/d/g, "д"], [/f/g, "ф"], [/g/g, "г"], [/k/g, "к"], [/l/g, "л"], [/m/g, "м"],
    [/n/g, "н"], [/p/g, "п"], [/r/g, "р"], [/s/g, "с"], [/t/g, "т"], [/v/g, "в"], [/z/g, "з"],
    [/a/g, "э"], [/e/g, "е"], [/i/g, "и"], [/o/g, "о"], [/u/g, "а"],
    [/[^Ѐ-ӿ\s'-]/g, ""],
  ];
  for (const [re, rep] of rules) w = w.replace(re, rep);
  return w;
}

function findRhyme(translit) {
  let best = null;
  for (const r of RHYME_BANK) {
    if (translit.includes(r) && (!best || r.length > best.length)) best = r;
  }
  return best;
}

/* ============ Проверка написанного ответа ============ */
function normalizeAnswer(s, isEnglish) {
  let out = s
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[()]/g, " ")
    .replace(/[.,;:!?"«»]/g, "")
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ")
    .trim();
  if (isEnglish) out = out.replace(/^(to|a|an|the)\s+(?=\S)/, "");
  return out;
}
function matchAnswer(userInput, field, isEnglish) {
  const u = normalizeAnswer(userInput, isEnglish);
  if (!u) return false;
  const variants = field.split(/[,;]/).map((v) => normalizeAnswer(v, isEnglish)).filter(Boolean);
  return variants.some((v) => {
    if (v === u) return true;
    if (u.length >= 3 && v.includes(u)) return true;
    if (v.length >= 3 && u.includes(v)) return true;
    return false;
  });
}

/* ============ Направление перевода ============ */
const LS_DIRECTION = "enapp_direction_v1";
let DIRECTION = loadJSON(LS_DIRECTION, "en-ru"); // "en-ru" | "ru-en" | "mixed"
function saveDirection(d) {
  DIRECTION = d;
  saveJSON(LS_DIRECTION, d);
  if (window.CloudSync) window.CloudSync.schedulePush();
}
function pickCardDirection() {
  if (DIRECTION === "mixed") return Math.random() < 0.5 ? "en-ru" : "ru-en";
  return DIRECTION;
}
function wrapWithDirections(words) {
  return words.map((w) => ({ word: w, dir: pickCardDirection() }));
}

const LS_AI_ASSOC_CACHE = "enapp_ai_assoc_cache_v1";
function loadAiAssocCache() { return loadJSON(LS_AI_ASSOC_CACHE, {}); }
function saveAiAssocCache(cache) { saveJSON(LS_AI_ASSOC_CACHE, cache); }
async function generateAiAssociationFor(en, ru) {
  const key = normKey(en);
  const cache = loadAiAssocCache();
  if (cache[key]) return cache[key];
  const prompt = `Придумай запоминающуюся ассоциацию (мнемонику) на русском языке для английского слова или фразы "${en}" (перевод: "${ru}"). Используй созвучие английского произношения с русскими словами или яркий образ, в духе этих примеров:
«ANNOY [эноЙ] — «ой, НОЮ!» — тот, кто постоянно ноет, раздражает: annoy = раздражать.»
«STUBBORN [стАбэн] — «СТОЛБ упёрся»: упрямый, как столб, не сдвинешь. stubborn = упрямый.»
Ответь одним-двумя предложениями — только сама ассоциация, без вступления и без кавычек вокруг всего ответа.`;
  const raw = await callGeminiRaw(prompt);
  const text = raw.trim();
  if (!text) throw new Error("Пустой ответ ИИ.");
  cache[key] = text;
  saveAiAssocCache(cache);
  return text;
}
function getAssociation(en, ru) {
  const key = normKey(en);
  const p = getProgress(en);
  if (p.customAssoc) return { text: p.customAssoc, tag: "custom" };
  if (ASSOC_OVERRIDES[key]) return { text: ASSOC_OVERRIDES[key], tag: "ai" };
  const aiCache = loadAiAssocCache();
  if (aiCache[key]) return { text: aiCache[key], tag: "ai" };
  const translit = transliterateEn(en);
  const rhyme = findRhyme(translit);
  let text;
  if (rhyme) {
    text = `«${en}» звучит примерно как «${translit}». Слышишь внутри «${rhyme}»? Представь яркую картинку: ${rhyme} и «${ru}» — свяжи их в одной сцене, и слово запомнится.`;
  } else {
    text = `«${en}» звучит примерно как «${translit}». Попробуй сам(а) найти похожее русское слово внутри «${translit}» и построить яркую картинку со значением «${ru}».`;
  }
  return { text, tag: "auto", translit };
}

/* ============ Навигация ============ */
const views = ["home", "words", "assoc", "texts", "duo"];
function showView(name) {
  views.forEach((v) => {
    document.getElementById("view-" + v).classList.toggle("active", v === name);
    document.getElementById("nav-" + v).classList.toggle("active", v === name);
  });
  if (name === "home") renderHome();
  if (name === "words") renderWords();
  if (name === "assoc") renderAssocList();
  if (name === "texts") renderTexts();
  if (name === "duo") renderDuo();
}

/* ============ Главная ============ */
function renderHome() {
  const passedForPct = countMastered() + countLearning();
  const progressPct = WORDS_DATA.length ? Math.round((passedForPct / WORDS_DATA.length) * 100) : 0;
  document.getElementById("stat-progress-pct").textContent = progressPct + "%";
  const t = HISTORY[todayStr()] || { reviewed: 0, correct: 0 };
  document.getElementById("stat-today").textContent = t.reviewed;
  document.getElementById("stat-due").textContent = countDue();
  document.getElementById("stat-total").textContent = WORDS_DATA.length;

  const mastered = countMastered();
  const learning = countLearning();
  document.getElementById("home-breakdown").innerHTML =
    `<div class="progressbar-outer"><div class="progressbar-inner" style="width:${(mastered / WORDS_DATA.length * 100).toFixed(1)}%"></div></div>
     <div style="font-size:12.5px;color:var(--muted);margin-top:6px;">
        Закреплено: <b style="color:var(--primary-dark)">${mastered}</b> ·
        Учится: <b style="color:var(--accent)">${learning}</b> ·
        Нужно подучить: <b style="color:var(--danger)">${countDue()}</b> ·
        Сложные слова: <b style="color:var(--warn)">${countDifficult()}</b>
     </div>`;
}

/* ============ Сессия повторения ============ */
let SESSION = null; // { queue, idx, correctCount, revealed }

function openSessionWithQueue(words) {
  if (words.length === 0) { alert("Нет слов для повторения."); return; }
  SESSION = {
    mode: "quiz",
    queue: wrapWithDirections(words), idx: 0, correctCount: 0, revealed: false, showAssoc: false,
    typedChecked: false, typedValue: "", typedCorrect: null,
  };
  document.getElementById("session-overlay").style.display = "flex";
  renderCard();
}
function startSession(n) {
  openSessionWithQueue(buildQueue(n));
}
function wordsByEn(enList) {
  const set = new Set(enList.map((e) => e.toLowerCase()));
  return shuffleArray(WORDS_DATA.filter((w) => set.has(w.en.toLowerCase())));
}
function startSessionForWords(enList) {
  openSessionWithQueue(wordsByEn(enList));
}
function startLearnForWords(enList) {
  const words = wordsByEn(enList);
  if (words.length === 0) { alert("Нет слов для изучения."); return; }
  SESSION = {
    mode: "learn",
    queue: words.map((w) => ({ word: w })), idx: 0, correctCount: 0, revealed: false, showAssoc: false,
    typedChecked: false, typedValue: "", typedCorrect: null,
    learnEnList: enList,
  };
  document.getElementById("session-overlay").style.display = "flex";
  renderCard();
}
function closeSession() {
  document.getElementById("session-overlay").style.display = "none";
  SESSION = null;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  const active = document.querySelector(".view.active");
  showView(active ? active.id.replace("view-", "") : "home");
}
function currentItem() { return SESSION.queue[SESSION.idx]; }
function currentWord() { return currentItem().word; }
function currentDir() { return currentItem().dir; }

function transcriptionHtml(w) {
  return w.tr ? `<div class="transcription">[${escapeHtml(w.tr)}]</div>` : "";
}

function renderCard() {
  const total = SESSION.queue.length;
  const idx = SESSION.idx;
  document.getElementById("session-progress-text").textContent = `${Math.min(idx + 1, total)} / ${total}`;
  document.getElementById("session-progress-bar").style.width = `${(Math.min(idx, total) / total) * 100}%`;

  if (idx >= total) {
    if (SESSION.mode === "learn") {
      const enListJson = JSON.stringify(SESSION.learnEnList).replace(/'/g, "&#39;");
      document.getElementById("flash-area").innerHTML = `
        <div class="session-done">
          <div class="big">📖</div>
          <h2>Слова показаны!</h2>
          <p>Теперь проверь, как запомнил(а), — так они попадут в повторение.</p>
          <button class="reveal-btn" onclick='startSessionForWords(${enListJson})'>✍️ Проверить себя</button>
          <button class="reveal-btn ghost" onclick="closeSession()">Позже</button>
        </div>`;
      return;
    }
    const pct = total ? Math.round((SESSION.correctCount / total) * 100) : 0;
    document.getElementById("flash-area").innerHTML = `
      <div class="session-done">
        <div class="big">🎉</div>
        <h2>Сессия завершена!</h2>
        <p>Правильно: <b>${SESSION.correctCount}</b> из <b>${total}</b> (${pct}%)</p>
        <button class="reveal-btn" onclick="closeSession()">Готово</button>
      </div>`;
    return;
  }

  if (SESSION.mode === "learn") {
    renderLearnCard();
    return;
  }

  const w = currentWord();
  const dir = currentDir();
  const isRuToEn = dir === "ru-en";
  const promptText = isRuToEn ? w.ru : w.en;
  const targetText = isRuToEn ? w.en : w.ru;
  const revealed = SESSION.revealed;
  let assocHtml = "";
  if (SESSION.showAssoc) {
    const a = getAssociation(w.en, w.ru);
    assocHtml = `<div class="assoc-box">🧠 ${escapeHtml(a.text)}</div>`;
  }

  let feedbackHtml = "";
  if (revealed && SESSION.typedChecked) {
    feedbackHtml = SESSION.typedCorrect
      ? `<div class="typed-feedback good">✅ Верно! Ты написал(а): «${escapeHtml(SESSION.typedValue)}»</div>`
      : SESSION.typedValue
        ? `<div class="typed-feedback bad">❌ Ты написал(а): «${escapeHtml(SESSION.typedValue)}»</div>`
        : `<div class="typed-feedback bad">❌ Пропущено</div>`;
  }

  // английское слово можно прослушать: сразу, если оно в вопросе, и после ответа, если оно в ответе
  const showSpeak = !isRuToEn || revealed;

  document.getElementById("flash-area").innerHTML = `
    <div class="flash-wrap">
      <div class="flashcard" id="flip-card">
        ${showSpeak ? speakButtonHtml(w.en, "card-speak-btn") : ""}
        ${revealed ? micButtonHtml(w.en, "card-mic-btn") : ""}
        <div class="dir-badge">${isRuToEn ? "RU → EN" : "EN → RU"}</div>
        <div class="es-word">${escapeHtml(promptText)}</div>
        ${!isRuToEn || revealed ? transcriptionHtml(w) : ""}
        ${revealed ? `<div class="ru-word">${escapeHtml(targetText)}</div>` : ""}
        ${feedbackHtml}
        ${assocHtml}
      </div>
      ${!revealed ? `
        <div class="type-answer-row">
          <input type="text" id="type-answer-input" class="type-answer-input" placeholder="Твой перевод..." autocomplete="off" autocapitalize="off" spellcheck="false">
          ${micAnswerButtonHtml(isRuToEn ? "en-US" : "ru-RU")}
          <button class="check-btn" onclick="checkTyped()">Проверить</button>
        </div>
        <button class="think-btn" onclick="toggleAssocInSession()">🧠 Не могу запомнить — показать ассоциацию</button>
      ` : `
        <button class="reveal-btn" onclick="nextCard()">Далее</button>
        <button class="think-btn" onclick="toggleAssocInSession()">🧠 ${SESSION.showAssoc ? "Скрыть" : "Показать"} ассоциацию</button>
      `}
    </div>`;

  if (!revealed) {
    const input = document.getElementById("type-answer-input");
    if (input) input.focus();
  }
}
function checkTyped() {
  const input = document.getElementById("type-answer-input");
  const value = input ? input.value.trim() : "";
  const item = currentItem();
  const w = item.word;
  const isRuToEn = item.dir === "ru-en";
  const targetText = isRuToEn ? w.en : w.ru;
  const correct = matchAnswer(value, targetText, isRuToEn);

  SESSION.typedChecked = true;
  SESSION.typedValue = value;
  SESSION.typedCorrect = correct;
  SESSION.revealed = true;

  registerReview(w.en, correct);
  if (correct) {
    SESSION.correctCount++;
  } else {
    // возвращаем слово в очередь через 3-5 карточек для повторного закрепления
    const reinsertAt = Math.min(SESSION.queue.length, SESSION.idx + 1 + 3 + Math.floor(Math.random() * 3));
    if (SESSION.queue.filter((x) => x.word.en === w.en).length < 2) {
      SESSION.queue.splice(reinsertAt, 0, item);
    }
  }
  renderCard();
  if (isRuToEn) speakEn(w.en);
}
function nextCard() {
  SESSION.idx++;
  SESSION.revealed = false;
  SESSION.showAssoc = false;
  SESSION.typedChecked = false;
  SESSION.typedValue = "";
  SESSION.typedCorrect = null;
  renderCard();
}
function toggleAssocInSession() {
  SESSION.showAssoc = !SESSION.showAssoc;
  if (SESSION.showAssoc && SESSION.mode !== "learn") markDifficult(currentWord().en);
  renderCard();
  if (SESSION.showAssoc) requestBetterAssocFor(currentWord(), renderCard);
}
function requestBetterAssocFor(w, onImproved) {
  const a = getAssociation(w.en, w.ru);
  if (a.tag !== "auto" || !loadAiKey()) return;
  generateAiAssociationFor(w.en, w.ru)
    .then(() => { if (SESSION && currentWord() && currentWord().en === w.en) onImproved(); })
    .catch(() => {});
}

/* ============ Карточка изучения (новые слова) ============ */
function renderLearnCard() {
  const w = currentWord();
  let assocHtml = "";
  if (SESSION.showAssoc) {
    const a = getAssociation(w.en, w.ru);
    assocHtml = `<div class="assoc-box">🧠 ${escapeHtml(a.text)}</div>`;
  }
  document.getElementById("flash-area").innerHTML = `
    <div class="flash-wrap">
      <div class="flashcard">
        ${speakButtonHtml(w.en, "card-speak-btn")}
        ${micButtonHtml(w.en, "card-mic-btn")}
        <div class="dir-badge learn-badge">📖 Изучение</div>
        <div class="es-word">${escapeHtml(w.en)}</div>
        ${transcriptionHtml(w)}
        <div class="ru-word">${escapeHtml(w.ru)}</div>
        ${assocHtml}
      </div>
      <button class="reveal-btn" onclick="nextCard()">Далее</button>
      <button class="think-btn" onclick="toggleAssocInSession()">🧠 ${SESSION.showAssoc ? "Скрыть" : "Показать"} ассоциацию</button>
    </div>`;
  if (!SESSION.showAssoc) speakEn(w.en);
}

/* ============ Слова (список) ============ */
let wordsFilter = "all";
let wordsSrcFilter = "all";
let wordsSearch = "";
function srcBadgeHtml(w) {
  if (w.src === "puzzle") return `<span class="src-badge puzzle">PE</span>`;
  if (w.src === "both") return `<span class="src-badge">Duo</span><span class="src-badge puzzle">PE</span>`;
  return "";
}
function matchesSrc(w, src) {
  if (src === "all") return true;
  return w.src === src || w.src === "both";
}
function renderWords() {
  const listEl = document.getElementById("words-list");
  const now = Date.now();
  let items = WORDS_DATA;
  if (wordsFilter === "due") items = items.filter((w) => isDue(getProgress(w.en), now));
  else if (wordsFilter === "difficult") items = items.filter((w) => getProgress(w.en).difficult);
  else if (wordsFilter === "mastered") items = items.filter((w) => getProgress(w.en).box >= 4);
  else if (wordsFilter === "new") items = items.filter((w) => getProgress(w.en).total === 0);
  items = items.filter((w) => matchesSrc(w, wordsSrcFilter));

  if (wordsSearch.trim()) {
    const s = wordsSearch.trim().toLowerCase();
    items = items.filter((w) => w.en.toLowerCase().includes(s) || w.ru.toLowerCase().includes(s));
  }

  document.getElementById("words-count").textContent = `${items.length} слов`;

  if (items.length === 0) {
    listEl.innerHTML = `<div class="empty-state">Ничего не найдено</div>`;
    return;
  }
  const frag = items.slice(0, 400).map((w) => {
    const p = getProgress(w.en);
    const dots = Array.from({ length: 5 }, (_, i) => `<span class="dot ${i < p.box ? "on" : ""}"></span>`).join("");
    return `<div class="word-row">
      <div>
        <div class="es">${escapeHtml(w.en)}${srcBadgeHtml(w)}</div>
        ${w.tr ? `<div class="transcription">[${escapeHtml(w.tr)}]</div>` : ""}
        <div class="ru">${escapeHtml(w.ru)}</div>
      </div>
      <div class="box-dots">${dots}</div>
      ${speakButtonHtml(w.en)}
      ${micButtonHtml(w.en)}
      <button class="assoc-btn" onclick="openAssocFor('${encodeURIComponent(w.en)}')">🧠</button>
    </div>`;
  }).join("");
  listEl.innerHTML = frag + (items.length > 400 ? `<div class="empty-state">Показаны первые 400 из ${items.length}. Уточни поиск.</div>` : "");
}

function setWordsFilter(f) {
  wordsFilter = f;
  document.querySelectorAll("#words-filters .filter-chip").forEach((el) => el.classList.toggle("active", el.dataset.f === f));
  renderWords();
}
function setWordsSrcFilter(src) {
  wordsSrcFilter = src;
  document.querySelectorAll("#words-src-filters .filter-chip").forEach((el) => el.classList.toggle("active", el.dataset.src === src));
  renderWords();
}

/* ============ Ассоциации ============ */
function renderAssocList() {
  const el = document.getElementById("assoc-list");
  const q = (document.getElementById("assoc-search").value || "").trim().toLowerCase();
  let items;
  if (q) {
    items = WORDS_DATA.filter((w) => w.en.toLowerCase().includes(q) || w.ru.toLowerCase().includes(q)).slice(0, 60);
  } else {
    items = WORDS_DATA.filter((w) => getProgress(w.en).difficult);
  }
  if (items.length === 0) {
    el.innerHTML = `<div class="empty-state">${q ? "Ничего не найдено" : "Пока нет сложных слов 🎉<br>Они появятся здесь, когда ты 3 раза ошибёшься в слове во время повторения — или нажми «Не могу запомнить» в сессии."}</div>`;
    return;
  }
  el.innerHTML = items.map((w) => renderAssocDetail(w)).join("");
}
function renderAssocDetail(w) {
  const a = getAssociation(w.en, w.ru);
  const p = getProgress(w.en);
  const tagLabel = a.tag === "ai" ? "🤖 ассоциация от ИИ" : a.tag === "custom" ? "✍️ твоя ассоциация" : "⚙️ черновая (авто)";
  const tagCls = a.tag === "auto" ? "auto" : "";
  const isAuto = a.tag === "auto";
  return `<div class="assoc-detail">
    <div class="es">${escapeHtml(w.en)} ${speakButtonHtml(w.en)}</div>
    ${w.tr ? `<div class="transcription">[${escapeHtml(w.tr)}]</div>` : ""}
    <div class="ru">${escapeHtml(w.ru)}</div>
    <span class="tag ${tagCls}">${tagLabel}</span>
    <div class="body">${escapeHtml(a.text)}</div>
    ${isAuto ? `
      <div class="assoc-request">
        Это черновая подсказка (просто созвучие), а не настоящая ассоциация.
        ${loadAiKey()
          ? `<button class="small-btn learn-btn" onclick="generateAiAssocForList('${encodeURIComponent(w.en)}', this)">🤖 Сгенерировать ассоциацию</button>`
          : `Вставь свой ключ ИИ в разделе «Тексты», чтобы генерировать ассоциации автоматически — или напиши мне в чате: <b>«сделай ассоциацию для ${escapeHtml(w.en)}»</b>.
             <button class="small-btn" onclick="copyWordToClipboard('${encodeURIComponent(w.en)}', this)">📋 Скопировать слово</button>`
        }
      </div>
    ` : ""}
    <textarea placeholder="Своя ассоциация (необязательно) — сохранится и заменит показанную выше" id="ta-${cssId(w.en)}">${escapeHtml(p.customAssoc || "")}</textarea>
    <div class="settings-row">
      <button class="small-btn" onclick="saveCustomAssoc('${encodeURIComponent(w.en)}')">Сохранить</button>
      ${p.difficult ? `<button class="small-btn" onclick="unmarkDifficult('${encodeURIComponent(w.en)}')">Убрать из сложных</button>` : `<button class="small-btn" onclick="markDifficultAndRerender('${encodeURIComponent(w.en)}')">Добавить в сложные</button>`}
    </div>
  </div>`;
}
async function generateAiAssocForList(enEnc, btn) {
  const en = decodeURIComponent(enEnc);
  const w = WORDS_DATA.find((x) => x.en === en);
  if (!w) return;
  const oldLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = "⏳ Генерирую...";
  try {
    await generateAiAssociationFor(w.en, w.ru);
    renderAssocList();
  } catch (e) {
    alert("Не получилось сгенерировать ассоциацию: " + e.message);
    btn.disabled = false;
    btn.textContent = oldLabel;
  }
}
function copyWordToClipboard(enEnc, btn) {
  const en = decodeURIComponent(enEnc);
  const text = `сделай ассоциацию для ${en}`;
  const done = () => { const old = btn.textContent; btn.textContent = "✅ Скопировано"; setTimeout(() => { btn.textContent = old; }, 1500); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => alert(text));
  } else {
    alert(text);
  }
}
function cssId(en) { return en.replace(/[^a-zA-Zа-яА-Я0-9]/g, "_"); }
function saveCustomAssoc(enEnc) {
  const en = decodeURIComponent(enEnc);
  const ta = document.getElementById("ta-" + cssId(en));
  const p = getProgress(en);
  p.customAssoc = ta.value.trim();
  saveProgress();
  renderAssocList();
}
function unmarkDifficult(enEnc) {
  const en = decodeURIComponent(enEnc);
  const p = getProgress(en);
  p.difficult = false; p.fails = 0;
  saveProgress();
  renderAssocList();
}
function markDifficultAndRerender(enEnc) {
  markDifficult(decodeURIComponent(enEnc));
  renderAssocList();
}
function openAssocFor(enEnc) {
  showView("assoc");
  document.getElementById("assoc-search").value = decodeURIComponent(enEnc);
  renderAssocList();
}

/* ============ Тексты (генерируются ИИ по запросу) ============ */
const LS_AI_KEY = "enapp_ai_key";
const LS_AI_KEY_ES = "esapp_ai_key"; // ключ из испанского приложения (тот же домен) — подхватываем, если свой не задан
let currentGeneratedText = null;
let currentTextLang = "en";
let genLang = "en";
let genLevel = "A2";

let KNOWN_SET = null;
function knownSet() {
  if (KNOWN_SET) return KNOWN_SET;
  const s = new Set();
  for (const w of WORDS_DATA) {
    const k = normKey(w.en).replace(/^(to|a|an)\s+/, "");
    s.add(k);
    // однословные формы из многословных записей тоже считаем знакомыми (например, «get up» → get, up)
    for (const part of k.split(/\s+/)) if (part.length > 1) s.add(part);
  }
  KNOWN_SET = s;
  return s;
}
const STOP_WORDS = new Set(["a","an","the","and","or","but","to","of","in","on","at","for","with","by","from","is","are","was","were","be","been","am","i","you","he","she","it","we","they","me","him","her","us","them","my","your","his","its","our","their","this","that","these","those","do","does","did","not","no","so","if","as","s","t","d","ll","ve","re","m"]);

function cleanToken(t) {
  return t.toLowerCase().replace(/[’‘`]/g, "'").replace(/[.,!?;:"“”()«»—–]/g, "").replace(/^'+|'+$/g, "");
}
// известное ли слово: прямое совпадение или простые формы (-s, -es, -ed, -ing, 's)
function isKnownToken(t) {
  const ks = knownSet();
  if (!t) return true;
  if (ks.has(t) || STOP_WORDS.has(t)) return true;
  const base = t.replace(/'s$/, "");
  if (ks.has(base)) return true;
  const cands = [t.replace(/s$/, ""), t.replace(/es$/, ""), t.replace(/ies$/, "y"), t.replace(/ed$/, ""), t.replace(/d$/, ""), t.replace(/ied$/, "y"), t.replace(/ing$/, ""), t.replace(/ing$/, "e"), t.replace(/([a-z])\1ing$/, "$1"), t.replace(/([a-z])\1ed$/, "$1")];
  return cands.some((c) => c && c !== t && ks.has(c));
}
function tokenize(text) {
  return text.split(/\s+/).map(cleanToken).filter(Boolean);
}
function textKnownPct(text) {
  const tokens = tokenize(text);
  if (tokens.length === 0) return 100;
  let known = 0;
  for (const t of tokens) if (isKnownToken(t)) known++;
  return Math.round((known / tokens.length) * 100);
}
function highlightUnknown(text) {
  return text.split(/(\s+)/).map((chunk) => {
    if (/^\s+$/.test(chunk)) return chunk;
    const clean = cleanToken(chunk);
    if (!clean) return escapeHtml(chunk);
    const cls = isKnownToken(clean) ? "tap-word" : "unknown tap-word";
    return `<span class="${cls}" onclick="showWordTranslation('${encodeURIComponent(clean)}')">${escapeHtml(chunk)}</span>`;
  }).join("");
}
function colorReaderPronunciation(target, heard) {
  const el = document.getElementById("reader-body");
  if (!el) return;
  const heardWords = new Set(normalizeForSpeech(heard).split(/\s+/).filter(Boolean));
  el.innerHTML = target.split(/(\s+)/).map((chunk) => {
    if (/^\s+$/.test(chunk)) return chunk;
    const clean = cleanToken(chunk);
    if (!clean) return escapeHtml(chunk);
    const said = heardWords.has(normalizeForSpeech(clean));
    const cls = "tap-word " + (said ? "pron-ok" : "pron-bad");
    return `<span class="${cls}" onclick="showWordTranslation('${encodeURIComponent(clean)}')">${escapeHtml(chunk)}</span>`;
  }).join("");
}
window.colorReaderPronunciation = colorReaderPronunciation;
const LS_WORD_TRANSLATE_CACHE = "enapp_word_translate_cache_v1";
function findWordForToken(t) {
  const direct = WORDS_DATA.find((x) => normKey(x.en) === t || normKey(x.en).replace(/^(to|a|an)\s+/, "") === t);
  return direct || null;
}
async function showWordTranslation(enEnc) {
  const en = decodeURIComponent(enEnc);
  speakEn(en);
  const popup = document.getElementById("word-translate-popup");
  if (!popup) return;
  popup.style.display = "block";
  const w = findWordForToken(en);
  if (w) { popup.innerHTML = `<b>${escapeHtml(w.en)}</b>${w.tr ? ` [${escapeHtml(w.tr)}]` : ""} — ${escapeHtml(w.ru)}`; return; }
  const cache = loadJSON(LS_WORD_TRANSLATE_CACHE, {});
  if (cache[en]) { popup.innerHTML = `<b>${escapeHtml(en)}</b> — ${escapeHtml(cache[en])}`; return; }
  if (!loadAiKey()) { popup.innerHTML = `<b>${escapeHtml(en)}</b> — нет в твоём словаре (вставь ключ ИИ выше, чтобы переводить и такие слова)`; return; }
  popup.innerHTML = `<b>${escapeHtml(en)}</b> — ищу перевод...`;
  try {
    const raw = await callGeminiRaw(`Переведи английское слово "${en}" на русский язык одним словом или короткой фразой (в контексте обычного текста). Если это форма глагола или множественное число — укажи в скобках начальную форму, например: «went» → «пошёл (go)». Ответь только переводом, без пояснений и кавычек.`);
    const translation = raw.trim();
    cache[en] = translation;
    saveJSON(LS_WORD_TRANSLATE_CACHE, cache);
    popup.innerHTML = `<b>${escapeHtml(en)}</b> — ${escapeHtml(translation)}`;
  } catch (e) {
    popup.innerHTML = `<b>${escapeHtml(en)}</b> — не удалось перевести (${escapeHtml(e.message)})`;
  }
}

function loadAiKey() {
  try {
    return (localStorage.getItem(LS_AI_KEY) || localStorage.getItem(LS_AI_KEY_ES) || "").trim();
  } catch (e) { return ""; }
}
async function callGeminiRaw(prompt) {
  const key = loadAiKey();
  if (!key) throw new Error("Нет сохранённого ключа ИИ.");
  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!resp.ok) {
    if (resp.status === 503) throw new Error("ИИ сейчас перегружен (слишком много запросов у Google). Подожди немного и попробуй ещё раз.");
    const errText = await resp.text().catch(() => "");
    throw new Error(`Сервер ответил ошибкой ${resp.status}. ${errText.slice(0, 200)}`);
  }
  const data = await resp.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}
function saveAiKey() {
  const input = document.getElementById("ai-key-input");
  const key = input.value.trim();
  if (!key) return;
  try { localStorage.setItem(LS_AI_KEY, key); } catch (e) {}
  input.value = "";
  renderTexts();
}
function clearAiKey() {
  try { localStorage.removeItem(LS_AI_KEY); } catch (e) {}
  renderTexts();
}
function setGenLang(lang) {
  genLang = lang;
  document.querySelectorAll("#gen-lang-toggle .filter-chip").forEach((el) => el.classList.toggle("active", el.dataset.lang === lang));
}
function setGenLevel(level) {
  genLevel = level;
  document.querySelectorAll("#gen-level-toggle .filter-chip").forEach((el) => el.classList.toggle("active", el.dataset.level === level));
}
function sampleVocabForPrompt(n) {
  // в первую очередь — слова, которые сейчас учатся или нужно подучить, плюс случайные из всего словаря
  const now = Date.now();
  const learning = shuffleArray(WORDS_DATA.filter((w) => { const p = getProgress(w.en); return p.total > 0 && (p.box < 4 || isDue(p, now)); }));
  const rest = shuffleArray(WORDS_DATA);
  const picked = [];
  const seen = new Set();
  for (const w of [...learning.slice(0, Math.floor(n / 2)), ...rest]) {
    if (picked.length >= n) break;
    if (seen.has(w.en)) continue;
    seen.add(w.en);
    picked.push(w.en);
  }
  return picked;
}
function renderTexts() {
  const key = loadAiKey();
  document.getElementById("ai-key-card").style.display = key ? "none" : "block";
  document.getElementById("ai-key-status").textContent = key ? "Ключ сохранён в этом браузере." : "";
  if (currentGeneratedText) {
    document.getElementById("texts-generate").style.display = "none";
    document.getElementById("text-reader").style.display = "block";
    renderReader();
  } else {
    document.getElementById("texts-generate").style.display = "block";
    document.getElementById("text-reader").style.display = "none";
  }
}
async function generateNewText() {
  const key = loadAiKey();
  if (!key) { alert("Сначала вставь и сохрани ключ ИИ выше."); return; }
  const btn = document.getElementById("generate-text-btn");
  const oldLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = "⏳ Генерирую...";
  const words = sampleVocabForPrompt(55);
  const levelHint = { A2: "уровень A2, простая грамматика, короткие предложения", B1: "уровень B1, разные времена (Present/Past/Future, Present Perfect)", B2: "уровень B2, естественный живой язык, сложные предложения" }[genLevel];
  const prompt = `Ты помощник для изучения английского языка. Составь короткий текст (5-7 предложений, ${levelHint}) на английском языке, используя как можно больше следующих слов и фраз из словаря ученика: ${words.join(", ")}. Тема свободная и естественная, текст связный.
Ответь СТРОГО в формате JSON без markdown-разметки и пояснений, ровно так:
{"title": "короткое название на русском", "en": "текст на английском", "ru": "точный перевод текста на русский"}`;
  try {
    const raw = await callGeminiRaw(prompt);
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    if (!parsed.en || !parsed.ru) throw new Error("Не удалось разобрать ответ ИИ.");
    currentGeneratedText = { title: parsed.title || "Новый текст", en: parsed.en, ru: parsed.ru };
    currentTextLang = genLang;
    document.getElementById("texts-generate").style.display = "none";
    document.getElementById("text-reader").style.display = "block";
    renderReader();
  } catch (e) {
    alert("Не получилось сгенерировать текст: " + e.message + "\n\nПроверь ключ (в начале раздела «Тексты») и соединение с интернетом.");
  } finally {
    btn.disabled = false;
    btn.textContent = oldLabel;
  }
}
function closeReader() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  document.getElementById("text-reader").style.display = "none";
  document.getElementById("texts-generate").style.display = "block";
}
async function translateOwnText() {
  const key = loadAiKey();
  if (!key) { alert("Сначала вставь и сохрани ключ ИИ выше."); return; }
  const input = document.getElementById("translate-input");
  const text = input.value.trim();
  if (!text) return;
  const btn = document.getElementById("translate-btn");
  const resultEl = document.getElementById("translate-result");
  const oldLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = "⏳ Перевожу...";
  resultEl.innerHTML = "";
  const prompt = `Определи, на каком языке написан следующий текст — на русском или на английском — и переведи его на другой язык (если текст на русском, переведи на английский; если на английском — переведи на русский). Текст: "${text}"
Ответь СТРОГО в формате JSON без markdown-разметки и пояснений, ровно так:
{"detected": "ru" или "en", "translation": "перевод"}`;
  try {
    const raw = await callGeminiRaw(prompt);
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    if (!parsed.translation) throw new Error("Пустой перевод.");
    const toEnglish = parsed.detected === "ru";
    const dirLabel = toEnglish ? "RU → EN" : "EN → RU";
    resultEl.innerHTML = `<div class="dir-badge" style="margin-top:10px;">${dirLabel}</div><div style="margin-top:6px;">${escapeHtml(parsed.translation)}</div>` +
      (toEnglish ? `<div style="margin-top:8px;">${speakButtonHtml(parsed.translation)}</div>` : "");
  } catch (e) {
    resultEl.innerHTML = `<div style="color:var(--danger);margin-top:10px;">Не получилось перевести: ${escapeHtml(e.message)}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = oldLabel;
  }
}
function setTextLang(lang) {
  currentTextLang = lang;
  renderReader();
}
function renderReader() {
  const t = currentGeneratedText;
  if (!t) return;
  const pct = textKnownPct(t.en);
  document.getElementById("reader-title").textContent = t.title;
  document.getElementById("lang-en-btn").classList.toggle("active", currentTextLang === "en");
  document.getElementById("lang-ru-btn").classList.toggle("active", currentTextLang === "ru");
  const body = currentTextLang === "en" ? highlightUnknown(t.en) : escapeHtml(t.ru);
  document.getElementById("reader-body").innerHTML = body;
  const popup = document.getElementById("word-translate-popup");
  if (popup) popup.style.display = "none";
  document.getElementById("reader-mic").innerHTML = currentTextLang === "en"
    ? micButtonHtml(t.en, "reader-mic-btn") + `<span class="reader-mic-label">Прочитай текст вслух и проверь произношение</span>`
    : "";
  document.getElementById("reader-meta").textContent = currentTextLang === "en" ? `Известно слов в тексте: ${pct}% (выделены слова, которых ещё нет в твоём наборе)` : "";
  document.getElementById("reader-speak-btn").style.display = currentTextLang === "en" ? "" : "none";
  const box = document.getElementById("reader-translate-box");
  box.style.display = "none";
  box.innerHTML = "";
  document.getElementById("reader-translate-btn").textContent = "🌐 Перевести текст";
}
function speakReaderText() {
  if (currentGeneratedText) speakEn(currentGeneratedText.en, 0.9);
}
function toggleReaderTranslation() {
  const t = currentGeneratedText;
  if (!t) return;
  const box = document.getElementById("reader-translate-box");
  const btn = document.getElementById("reader-translate-btn");
  const showing = box.style.display !== "none";
  if (showing) {
    box.style.display = "none";
    btn.textContent = "🌐 Перевести текст";
  } else {
    box.textContent = currentTextLang === "en" ? t.ru : t.en;
    box.style.display = "block";
    btn.textContent = "🌐 Скрыть перевод";
  }
}
function regenerateText() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  currentGeneratedText = null;
  document.getElementById("text-reader").style.display = "none";
  document.getElementById("texts-generate").style.display = "block";
}

/* ============ Уроки: источники слов + конспекты ============ */
const SOURCES = [
  { key: "duo", icon: "🦉", name: "Duolingo", desc: "Выученные слова курса английского (раздел «Тренировка → Слова»)." },
  { key: "puzzle", icon: "🧩", name: "Puzzle English", desc: "Слова и выражения из «Моего словаря» — с транскрипцией." },
];
const BATCH_SIZE = 20;
function sourceWords(src) { return WORDS_DATA.filter((w) => matchesSrc(w, src)); }
// следующая порция для изучения: сначала новые слова (ещё ни разу не повторялись), в порядке словаря
function nextBatch(src, onlyNew) {
  const words = sourceWords(src);
  const fresh = words.filter((w) => getProgress(w.en).total === 0);
  const pool = onlyNew || fresh.length ? fresh : words;
  return pool.slice(0, BATCH_SIZE).map((w) => w.en);
}
function learnSourceBatch(src) {
  const list = nextBatch(src, true);
  if (!list.length) { alert("Новых слов в этом источнике не осталось — все уже в повторении 🎉"); return; }
  startLearnForWords(list);
}
function checkSourceBatch(src) {
  // проверка: слова источника, которые пора повторить; если таких нет — следующие новые
  const now = Date.now();
  const words = sourceWords(src);
  const due = words.filter((w) => { const p = getProgress(w.en); return p.total > 0 && isDue(p, now); });
  const list = (due.length ? shuffleArray(due) : words.filter((w) => getProgress(w.en).total === 0)).slice(0, BATCH_SIZE).map((w) => w.en);
  if (!list.length) { alert("Сейчас нечего проверять — все слова закреплены до следующего повторения."); return; }
  startSessionForWords(list);
}
function renderSources() {
  const el = document.getElementById("sources-list");
  if (!el) return;
  el.innerHTML = SOURCES.map((s) => {
    const words = sourceWords(s.key);
    const total = words.length;
    const fresh = words.filter((w) => getProgress(w.en).total === 0).length;
    const mastered = words.filter((w) => getProgress(w.en).box >= 4).length;
    const pct = total ? Math.round(((total - fresh) / total) * 100) : 0;
    return `<div class="card source-card" style="margin-bottom:12px;">
      <div class="source-head">
        <div class="source-name">${s.icon} ${s.name}</div>
        <div style="font-size:13px;color:var(--muted);">${total} слов</div>
      </div>
      <div class="source-meta">${s.desc}</div>
      <div class="progressbar-outer" style="margin-top:10px;"><div class="progressbar-inner" style="width:${pct}%"></div></div>
      <div class="source-meta">Начато: <b>${total - fresh}</b> · Новых: <b>${fresh}</b> · Закреплено: <b>${mastered}</b></div>
      <div class="settings-row" style="margin-top:10px;">
        <button class="small-btn learn-btn" onclick="learnSourceBatch('${s.key}')">📖 Изучить ${BATCH_SIZE} новых</button>
        <button class="small-btn" onclick="checkSourceBatch('${s.key}')">✍️ Проверить себя</button>
        <button class="small-btn" onclick="showView('words'); setWordsSrcFilter('${s.key}')">📚 Список</button>
      </div>
    </div>`;
  }).join("");
}

function formatDateRu(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}
function renderDuo() {
  renderSources();
  const el = document.getElementById("duo-list");
  if (typeof DUO_LOG === "undefined" || DUO_LOG.length === 0) {
    el.innerHTML = `<div class="empty-state">Пока нет разборов уроков. Попроси «пройди урок дуолинго» или «пройди урок Puzzle English» — и конспект появится здесь.</div>`;
    return;
  }
  const days = [...DUO_LOG].sort((a, b) => (a.date < b.date ? 1 : -1));
  el.innerHTML = days.map((day) => renderDuoDay(day)).join("");
}
function renderDuoDay(day) {
  const srcLabel = day.source === "puzzle" ? "🧩 Puzzle English" : "🦉 Duolingo";
  const lessonsHtml = (day.lessons || []).map((l) => {
    let scoreHtml = "";
    if (l.total) {
      const pct = Math.round((l.correct / l.total) * 100);
      scoreHtml = `<span class="duo-lesson-score">${l.perfect ? "💯" : pct + "%"} (${l.correct}/${l.total})</span>`;
    }
    return `<div class="duo-lesson-row">
      <span>${escapeHtml(l.skill)} · ${escapeHtml(l.lessonNum)}</span>
      ${scoreHtml}
    </div>`;
  }).join("");

  const newWords = day.newWords || [];
  const wordsHtml = newWords.map((en) => {
    const w = WORDS_DATA.find((x) => x.en.toLowerCase() === en.toLowerCase());
    if (!w) return "";
    return `<div class="duo-word-chip"><b>${escapeHtml(w.en)}</b> — ${escapeHtml(w.ru)}</div>`;
  }).join("");

  const rulesHtml = (day.rules || []).map((r) => `
    <div class="duo-rule">
      <div class="duo-rule-title">📐 ${escapeHtml(r.title)}</div>
      <div class="duo-rule-body">${escapeHtml(r.explanation).replace(/\n/g, "<br>")}</div>
    </div>`).join("");

  const listJson = JSON.stringify(newWords).replace(/'/g, "&#39;");
  return `<div class="duo-day card">
    <div class="duo-day-date">${formatDateRu(day.date)} · ${srcLabel}</div>
    <div class="duo-lessons">${lessonsHtml}</div>

    ${wordsHtml ? `
      <div class="section-title" style="margin-top:14px;">Новые слова (${newWords.length})</div>
      <div class="duo-words-grid">${wordsHtml}</div>
      <div class="settings-row" style="margin-top:8px;">
        <button class="small-btn learn-btn" onclick='startLearnForWords(${listJson})'>📖 Изучить</button>
        <button class="small-btn" onclick='startSessionForWords(${listJson})'>✍️ Проверить себя</button>
      </div>
    ` : ""}

    ${rulesHtml ? `<div class="section-title" style="margin-top:14px;">Правила — почему так, а не иначе</div>${rulesHtml}` : ""}
  </div>`;
}

/* ============ helpers ============ */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ============ настройки: экспорт/импорт/сброс ============ */
function exportData() {
  const blob = new Blob([JSON.stringify({ PROGRESS, HISTORY, STREAK }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `english-words-progress-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.PROGRESS) PROGRESS = data.PROGRESS;
      if (data.HISTORY) HISTORY = data.HISTORY;
      if (data.STREAK) STREAK = data.STREAK;
      saveProgress(); saveHistory(); saveStreak();
      alert("Прогресс импортирован!");
      renderHome();
    } catch (e) { alert("Не удалось прочитать файл."); }
  };
  reader.readAsText(file);
}
function resetProgress() {
  if (!confirm("Сбросить весь прогресс повторения? Список слов останется.")) return;
  PROGRESS = {}; HISTORY = {}; STREAK = { streak: 0, lastDate: null };
  saveProgress(); saveHistory(); saveStreak();
  renderHome();
}

/* ============ инициализация ============ */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("nav-home").addEventListener("click", () => showView("home"));
  document.getElementById("nav-words").addEventListener("click", () => showView("words"));
  document.getElementById("nav-assoc").addEventListener("click", () => showView("assoc"));
  document.getElementById("nav-texts").addEventListener("click", () => showView("texts"));
  document.getElementById("nav-duo").addEventListener("click", () => showView("duo"));

  document.getElementById("btn-15").addEventListener("click", () => startSession(15));
  document.getElementById("btn-25").addEventListener("click", () => startSession(25));
  document.getElementById("btn-40").addEventListener("click", () => startSession(40));
  document.getElementById("session-close").addEventListener("click", closeSession);
  document.getElementById("flash-area").addEventListener("keydown", (e) => {
    if (!(e.key === "Enter" || e.keyCode === 13)) return;
    if (e.target && e.target.id === "type-answer-input") {
      e.preventDefault();
      checkTyped();
    } else if (SESSION && (SESSION.revealed || SESSION.mode === "learn")) {
      e.preventDefault();
      nextCard();
    }
  });

  document.querySelectorAll("#dir-toggle .filter-chip").forEach((el) => {
    el.classList.toggle("active", el.dataset.dir === DIRECTION);
    el.addEventListener("click", () => {
      saveDirection(el.dataset.dir);
      document.querySelectorAll("#dir-toggle .filter-chip").forEach((x) => x.classList.toggle("active", x === el));
    });
  });

  document.querySelectorAll("#words-filters .filter-chip").forEach((el) => {
    el.addEventListener("click", () => setWordsFilter(el.dataset.f));
  });
  document.querySelectorAll("#words-src-filters .filter-chip").forEach((el) => {
    el.addEventListener("click", () => setWordsSrcFilter(el.dataset.src));
  });
  document.getElementById("words-search").addEventListener("input", (e) => {
    wordsSearch = e.target.value; renderWords();
  });
  document.getElementById("assoc-search").addEventListener("input", renderAssocList);

  document.getElementById("lang-en-btn").addEventListener("click", () => setTextLang("en"));
  document.getElementById("lang-ru-btn").addEventListener("click", () => setTextLang("ru"));
  document.getElementById("reader-back").addEventListener("click", closeReader);

  document.getElementById("btn-export").addEventListener("click", exportData);
  document.getElementById("btn-reset").addEventListener("click", resetProgress);
  document.getElementById("import-file").addEventListener("change", (e) => {
    if (e.target.files[0]) importData(e.target.files[0]);
  });

  showView("home");
});
