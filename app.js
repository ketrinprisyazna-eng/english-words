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
const views = ["home", "words", "rules", "assoc", "texts", "duo", "phrasal", "puzzle", "diary", "archive"];
// разделы архива: в меню подсвечивается «Архив»
const NAV_OF_VIEW = { words: "archive", rules: "archive", assoc: "archive", duo: "archive", phrasal: "archive" };
function showView(name) {
  views.forEach((v) => {
    document.getElementById("view-" + v).classList.toggle("active", v === name);
    const nav = document.getElementById("nav-" + v);
    if (nav) nav.classList.toggle("active", v === (NAV_OF_VIEW[name] || name));
  });
  if (name === "home") renderHome();
  if (name === "words") renderWords();
  if (name === "assoc") renderAssocList();
  if (name === "texts") renderDialog();
  if (name === "duo") renderDuo();
  if (name === "rules") renderRules();
  if (name === "phrasal") renderPhrasalPage();
  if (name === "puzzle") renderPuzzle();
  if (name === "diary") renderDiary();
  if (name === "archive") renderArchive();
  window.scrollTo(0, 0);
}

/* ============ Главная ============ */
function renderHome() {
  renderReviewHome();
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
  document.getElementById("session-progress-text").textContent = `${reviewStepLabel()}${Math.min(idx + 1, total)} / ${total}`;
  document.getElementById("session-progress-bar").style.width = `${(Math.min(idx, total) / total) * 100}%`;

  if (idx >= total) {
    if (SESSION.mode === "review") { renderReviewStepEnd(); return; }
    if (SESSION.mode === "learn") {
      const enListJson = JSON.stringify(SESSION.learnEnList).replace(/'/g, "&#39;");
      document.getElementById("flash-area").innerHTML = `
        <div class="session-done">
          <div class="big">${ico("book-2")}</div>
          <h2>Слова показаны!</h2>
          <p>Теперь проверь, как запомнил(а), — так они попадут в повторение.</p>
          <button class="reveal-btn" onclick='startSessionForWords(${enListJson})'>${ico("pencil")} Проверить себя</button>
          <button class="reveal-btn ghost" onclick="closeSession()">Позже</button>
        </div>`;
      return;
    }
    const pct = total ? Math.round((SESSION.correctCount / total) * 100) : 0;
    let examHtml = "";
    if (SESSION.ruleExam) {
      // засчитываем только ответы с первой попытки: повторы ошибок в очереди не добавляют баллов
      const firstTry = SESSION.examSize ? Math.round(((SESSION.examFirstCorrect || 0) / SESSION.examSize) * 100) : 0;
      const score = Math.min(100, firstTry);
      const r = RULES.find((x) => x.id === SESSION.ruleExam);
      if (score >= RULE_EXAM_PASS * 100 && SESSION.examSize >= Math.min(8, ruleWordsList(SESSION.ruleExam).length)) {
        if (!SESSION.examSaved) { markRuleLearned(SESSION.ruleExam, "exam", score); SESSION.examSaved = true; }
        examHtml = `<p class="exam-result good">${ico("check")} Правило «${escapeHtml(ruleShortTitle(r))}» сдано на ${score}% и вычеркнуто.</p>`;
      } else {
        examHtml = `<p class="exam-result">Чтобы вычеркнуть «${escapeHtml(ruleShortTitle(r))}», нужно 90% с первой попытки. Сейчас ${score}% — повтори слова и попробуй ещё раз.</p>`;
      }
    }
    document.getElementById("flash-area").innerHTML = `
      <div class="session-done">
        <div class="big">${ico("confetti")}</div>
        <h2>Сессия завершена!</h2>
        <p>Правильно: <b>${SESSION.correctCount}</b> из <b>${total}</b> (${pct}%)</p>
        ${examHtml}
        <button class="reveal-btn" onclick="closeSession()">Готово</button>
      </div>`;
    return;
  }

  if (SESSION.mode === "learn") {
    renderLearnCard();
    return;
  }
  // тип карточки определяется самим заданием — так в одном повторении идут слова, тренажёры и правила
  const curItem = SESSION.queue[SESSION.idx];
  if (curItem.ph) { renderPhrasalCard(); return; }
  if (curItem.kp) { renderKeyPhraseCard(); return; }
  if (curItem.ruleTask) { renderRuleTaskCard(); return; }
  if (curItem.fill) { renderFillCard(); return; }
  if (curItem.tr) { renderTrCard(); return; }

  const w = currentWord();
  const dir = currentDir();
  const isRuToEn = dir === "ru-en";
  const promptText = isRuToEn ? w.ru : w.en;
  const targetText = isRuToEn ? w.en : w.ru;
  const revealed = SESSION.revealed;
  let assocHtml = "";
  if (SESSION.showAssoc) {
    const a = getAssociation(w.en, w.ru);
    assocHtml = `<div class="assoc-box">${ico("bulb")} ${escapeHtml(a.text)}</div>`;
  }

  let feedbackHtml = "";
  if (revealed && SESSION.typedChecked) {
    feedbackHtml = SESSION.typedCorrect
      ? `<div class="typed-feedback good">${ico("check")} Верно. Ты написал(а): «${escapeHtml(SESSION.typedValue)}»</div>`
      : SESSION.typedValue
        ? `<div class="typed-feedback bad">${ico("x")} Ты написал(а): «${escapeHtml(SESSION.typedValue)}»</div>`
        : `<div class="typed-feedback bad">${ico("x")} Пропущено</div>`;
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
        ${revealed ? ruleHintHtml(w) : ""}
        ${assocHtml}
      </div>
      ${!revealed ? `
        <div class="type-answer-row">
          <input type="text" id="type-answer-input" class="type-answer-input" placeholder="Твой перевод..." autocomplete="off" autocapitalize="off" spellcheck="false">
          ${micAnswerButtonHtml(isRuToEn ? "en-US" : "ru-RU")}
          <button class="check-btn" onclick="checkTyped()">Проверить</button>
        </div>
        <button class="think-btn" onclick="toggleAssocInSession()">${ico("bulb")} Не могу запомнить — показать ассоциацию</button>
      ` : `
        <button class="reveal-btn" onclick="nextCard()">Далее</button>
        <button class="think-btn" onclick="toggleAssocInSession()">${ico("bulb")} ${SESSION.showAssoc ? "Скрыть" : "Показать"} ассоциацию</button>
      `}
    </div>`;

  if (!revealed) {
    const input = document.getElementById("type-answer-input");
    if (input) input.focus({ preventScroll: true });
  }
}
function checkTyped() {
  const curItem = SESSION && SESSION.queue[SESSION.idx];
  if (curItem && curItem.ph) { checkPhrasalGap(); return; }
  if (curItem && curItem.kp) { checkKeyPhrase(); return; }
  if (curItem && curItem.ruleTask) { checkRuleTask(); return; }
  if (curItem && curItem.fill) { checkFill(); return; }
  if (curItem && curItem.tr) { checkTr(); return; }
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
  if (typeof reviewTrack === "function") reviewTrack("w:" + w.en, correct);
  if (SESSION.ruleExam) {
    if (!SESSION.examSeen) { SESSION.examSeen = {}; SESSION.examFirstCorrect = 0; }
    if (!SESSION.examSeen[w.en]) { SESSION.examSeen[w.en] = true; if (correct) SESSION.examFirstCorrect++; }
  }
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
  const overlay = document.getElementById("session-overlay");
  if (overlay) overlay.scrollTop = 0;
  SESSION.idx++;
  SESSION.revealed = false;
  SESSION.showAssoc = false;
  SESSION.typedChecked = false;
  SESSION.typedValue = "";
  SESSION.typedCorrect = null;
  SESSION.chosen = null;
  SESSION.options = null;
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
    assocHtml = `<div class="assoc-box">${ico("bulb")} ${escapeHtml(a.text)}</div>`;
  }
  document.getElementById("flash-area").innerHTML = `
    <div class="flash-wrap">
      <div class="flashcard">
        ${speakButtonHtml(w.en, "card-speak-btn")}
        ${micButtonHtml(w.en, "card-mic-btn")}
        <div class="dir-badge learn-badge">Изучение</div>
        <div class="es-word">${escapeHtml(w.en)}</div>
        ${transcriptionHtml(w)}
        <div class="ru-word">${escapeHtml(w.ru)}</div>
        ${ruleHintHtml(w)}
        ${assocHtml}
      </div>
      <button class="reveal-btn" onclick="nextCard()">Далее</button>
      <button class="think-btn" onclick="toggleAssocInSession()">${ico("bulb")} ${SESSION.showAssoc ? "Скрыть" : "Показать"} ассоциацию</button>
    </div>`;
  if (!SESSION.showAssoc) speakEn(w.en);
}

/* ============ Слова (список) ============ */
let wordsFilter = "all";
let wordsSrcFilter = "all";
let wordsSearch = "";
function srcBadgeHtml(w) {
  if (w.src === "puzzle") return `<span class="src-badge puzzle">PE</span>`;
  if (w.src === "extra") return `<span class="src-badge">доп.</span>`;
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
        ${ruleChipsHtml(w)}
      </div>
      <div class="box-dots">${dots}</div>
      ${speakButtonHtml(w.en)}
      ${micButtonHtml(w.en)}
      <button class="assoc-btn" onclick="openAssocFor('${encodeURIComponent(w.en)}')" title="Ассоциация" aria-label="Ассоциация">${ico("bulb")}</button>
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
    el.innerHTML = `<div class="empty-state">${q ? "Ничего не найдено" : "Пока нет сложных слов.<br>Они появятся здесь, когда ты 3 раза ошибёшься в слове во время повторения — или нажми «Не могу запомнить» в сессии."}</div>`;
    return;
  }
  el.innerHTML = items.map((w) => renderAssocDetail(w)).join("");
}
function renderAssocDetail(w) {
  const a = getAssociation(w.en, w.ru);
  const p = getProgress(w.en);
  const tagLabel = a.tag === "ai" ? "ассоциация от ИИ" : a.tag === "custom" ? "твоя ассоциация" : "черновая, по созвучию";
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
          ? `<button class="small-btn learn-btn" onclick="generateAiAssocForList('${encodeURIComponent(w.en)}', this)">${ico("sparkles")} Сгенерировать ассоциацию</button>`
          : `Вставь свой ключ ИИ в разделе «Тексты», чтобы генерировать ассоциации автоматически — или напиши мне в чате: <b>«сделай ассоциацию для ${escapeHtml(w.en)}»</b>.
             <button class="small-btn" onclick="copyWordToClipboard('${encodeURIComponent(w.en)}', this)">${ico("copy")} Скопировать слово</button>`
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
  const oldLabel = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = ico("loader-2", "spin") + " Генерирую…";
  try {
    await generateAiAssociationFor(w.en, w.ru);
    renderAssocList();
  } catch (e) {
    alert("Не получилось сгенерировать ассоциацию: " + e.message);
    btn.disabled = false;
    btn.innerHTML = oldLabel;
  }
}
function copyWordToClipboard(enEnc, btn) {
  const en = decodeURIComponent(enEnc);
  const text = `сделай ассоциацию для ${en}`;
  const done = () => { const old = btn.innerHTML; btn.innerHTML = ico("check") + " Скопировано"; setTimeout(() => { btn.innerHTML = old; }, 1500); };
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

/* ============ ИИ (Gemini) и знакомые слова — для диалога ============ */
const LS_AI_KEY = "enapp_ai_key";
const LS_AI_KEY_ES = "esapp_ai_key"; // ключ из испанского приложения (тот же домен) — подхватываем, если свой не задан

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
async function callGeminiRaw(prompt, json) {
  const key = loadAiKey();
  if (!key) throw new Error("Нет сохранённого ключа ИИ.");
  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json
      ? { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.7 } }
      : { contents: [{ parts: [{ text: prompt }] }] }),
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
  renderDialog();
}
function clearAiKey() {
  try { localStorage.removeItem(LS_AI_KEY); } catch (e) {}
  renderDialog();
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
/* ============ Уроки: источники слов + конспекты ============ */
const SOURCES = [
  { key: "duo", name: "Duolingo", desc: "Выученные слова курса английского (раздел «Тренировка → Слова»)." },
  { key: "puzzle", name: "Puzzle English", desc: "Слова и выражения из «Моего словаря» — с транскрипцией." },
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
  if (!list.length) { alert("Новых слов в этом источнике не осталось — все уже в повторении."); return; }
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
        <div class="source-name">${s.name}</div>
        <div style="font-size:13px;color:var(--muted);">${total} слов</div>
      </div>
      <div class="source-meta">${s.desc}</div>
      <div class="progressbar-outer" style="margin-top:10px;"><div class="progressbar-inner" style="width:${pct}%"></div></div>
      <div class="source-meta">Начато: <b>${total - fresh}</b> · Новых: <b>${fresh}</b> · Закреплено: <b>${mastered}</b></div>
      <div class="settings-row" style="margin-top:10px;">
        <button class="small-btn learn-btn" onclick="learnSourceBatch('${s.key}')">${ico("book-2")} Изучить ${BATCH_SIZE} новых</button>
        <button class="small-btn" onclick="checkSourceBatch('${s.key}')">${ico("pencil")} Проверить себя</button>
        <button class="small-btn" onclick="showView('words'); setWordsSrcFilter('${s.key}')">${ico("list")} Список</button>
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
  const mc = document.getElementById("mistakes-count");
  if (mc) mc.textContent = `(${allMistakes().length})`;
  if (duoTab === "mistakes") renderMistakes();
  const el = document.getElementById("duo-list");
  if (typeof DUO_LOG === "undefined" || DUO_LOG.length === 0) {
    el.innerHTML = `<div class="empty-state">Пока нет разборов уроков. Попроси «пройди урок дуолинго» или «пройди урок Puzzle English» — и конспект появится здесь.</div>`;
    return;
  }
  const days = [...DUO_LOG].sort((a, b) => (a.date < b.date ? 1 : -1));
  el.innerHTML = days.map((day) => renderDuoDay(day)).join("");
}
function renderDuoDay(day) {
  const srcLabel = day.source === "puzzle" ? "Puzzle English" : "Duolingo";
  const lessonsHtml = (day.lessons || []).map((l) => {
    let scoreHtml = "";
    if (l.total) {
      const pct = Math.round((l.correct / l.total) * 100);
      scoreHtml = `<span class="duo-lesson-score">${l.perfect ? "без ошибок" : pct + "%"} (${l.correct}/${l.total})</span>`;
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
      <div class="duo-rule-title">${escapeHtml(r.title)}</div>
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
        <button class="small-btn learn-btn" onclick='startLearnForWords(${listJson})'>${ico("book-2")} Изучить</button>
        <button class="small-btn" onclick='startSessionForWords(${listJson})'>${ico("pencil")} Проверить себя</button>
      </div>
    ` : ""}

    ${rulesHtml ? `<div class="section-title" style="margin-top:14px;">Правила — почему так, а не иначе</div>${rulesHtml}` : ""}
  </div>`;
}

/* ============ Правила ============ */
// ключ для сравнения слов словаря с правилами: нижний регистр, без «to/a/an» в начале
function ruleKey(s) { return String(s).trim().toLowerCase().replace(/[’‘`]/g, "'").replace(/^(to|a|an)\s+(?=\S)/, ""); }

let RULE_INDEX = null; // { byRule: {id: {groups:[{label, words:[w]}], verbRows, words:[w]}}, byWord: {normKey: [ruleId]} }
function buildRuleIndex() {
  if (RULE_INDEX) return RULE_INDEX;
  const byKey = new Map();
  const byExact = new Map();
  for (const w of WORDS_DATA) {
    byExact.set(normKey(w.en), w);
    const k = ruleKey(w.en);
    if (!byKey.has(k)) byKey.set(k, w);
  }
  const find = (s) => byExact.get(normKey(s)) || byKey.get(ruleKey(s)) || null;
  const byRule = {};
  const byWord = {};
  const addWordRule = (w, id) => {
    const k = normKey(w.en);
    if (!byWord[k]) byWord[k] = [];
    if (!byWord[k].includes(id)) byWord[k].push(id);
  };

  for (const rule of RULES) {
    const entry = { groups: [], verbGroups: [], words: [] };
    const seen = new Set();
    const take = (w) => { if (!w || seen.has(w.en)) return false; seen.add(w.en); entry.words.push(w); addWordRule(w, rule.id); return true; };

    if (rule.irregular) {
      // неправильные глаголы: строка таблицы попадает в правило, если в словаре есть хоть одна её форма
      const formOwner = new Map(); // форма → строка
      for (const g of IRREGULAR_VERBS) for (const v of g.verbs) {
        const forms = [v[0], ...v[1].split("/").map((s) => s.trim()), v[2]];
        for (const f of forms) if (!formOwner.has(f)) formOwner.set(f, v);
      }
      const rowWords = new Map(); // строка → [слова словаря]
      for (const w of WORDS_DATA) {
        const k = ruleKey(w.en);
        let row = formOwner.get(k);
        if (!row) {
          // «given up», «woke up», «fell down»: первое слово — 2-я/3-я форма неправильного глагола
          const first = k.split(/\s+/)[0];
          const r = formOwner.get(first);
          if (r && first !== r[0] && k.split(/\s+/).length <= 3) row = r;
        }
        if (row) { if (!rowWords.has(row)) rowWords.set(row, []); rowWords.get(row).push(w); }
      }
      for (const g of IRREGULAR_VERBS) {
        const rows = g.verbs.filter((v) => rowWords.has(v)).map((v) => ({ verb: v, words: rowWords.get(v) }));
        if (!rows.length) continue;
        rows.forEach((r) => r.words.forEach(take));
        entry.verbGroups.push({ label: g.group, hook: g.hook, rows });
      }
    }

    for (const g of rule.groups || []) {
      const words = [];
      for (const s of g.words) { const w = find(s); if (w && !words.includes(w)) { words.push(w); take(w); } }
      entry.groups.push({ label: g.label, words, auto: !!g.auto });
    }

    if (rule.pattern) {
      const exclude = new Set((rule.exclude || []).map((s) => s.toLowerCase()));
      const extra = WORDS_DATA.filter((w) => rule.pattern.test(w.en) && !exclude.has(w.en.toLowerCase()) && !seen.has(w.en));
      extra.forEach(take);
      if (extra.length) {
        const autoGroup = entry.groups.find((g) => g.auto);
        if (autoGroup) autoGroup.words.push(...extra);
        else entry.groups.push({ label: "Ещё из твоего словаря", words: extra });
      }
    }
    entry.groups = entry.groups.filter((g) => g.words.length);
    byRule[rule.id] = entry;
  }
  RULE_INDEX = { byRule, byWord };
  return RULE_INDEX;
}
function rulesForWord(w) { return (buildRuleIndex().byWord[normKey(w.en)] || []).map((id) => RULES.find((r) => r.id === id)).filter(Boolean); }
function ruleShortTitle(rule) { return rule.title.split(":")[0]; }
function irregularRowFor(w) {
  const entry = buildRuleIndex().byRule["irregular"];
  if (!entry) return null;
  for (const g of entry.verbGroups) for (const r of g.rows) if (r.words.includes(w)) return r.verb;
  return null;
}
function verbFormsHtml(v) {
  return `<b>${escapeHtml(v[0])}</b> – <b>${escapeHtml(v[1])}</b> – <b>${escapeHtml(v[2])}</b>`;
}
// подсказка правила на карточке: первое (главное) правило слова + его запоминалка
function ruleHintHtml(w) {
  const rules = rulesForWord(w);
  if (!rules.length) return "";
  const rule = rules[0];
  const v = rule.id === "irregular" ? irregularRowFor(w) : null;
  const text = v ? `${verbFormsHtml(v)} (${escapeHtml(v[3])})` : escapeHtml(rule.hook);
  const more = rules.length > 1 ? `<div class="rule-hint-more">Ещё: ${rules.slice(1).map((r) => escapeHtml(ruleShortTitle(r))).join(" · ")}</div>` : "";
  return `<div class="rule-hint"><div class="rule-hint-title">${escapeHtml(ruleShortTitle(rule))}</div><div>${text}</div>${more}</div>`;
}
function ruleChipsHtml(w) {
  return rulesForWord(w).map((r) => `<span class="rule-chip" onclick="event.stopPropagation(); openRule('${r.id}')">${escapeHtml(ruleShortTitle(r))}</span>`).join("");
}

/* ---------- «Выучено»: правило вычеркнуто, когда материал действительно знаешь ----------
   Три пути:
   1) экзамен по правилу (кнопка «Сдать правило») — 90%+ верных с первой попытки;
   2) само: 80%+ слов правила закреплены интервальным повторением (box ≥ 3);
   3) вручную: «Знаю — вычеркнуть».
   «Вернуть в изучение» снимает отметку и отключает авто-вычёркивание по словам,
   пока правило снова не будет сдано на экзамене. */
const LS_RULES = "enapp_rules_v1";
let RULE_STATE = loadJSON(LS_RULES, {}); // { id: { learned: bool, at, how: "exam"|"manual"|"returned", score } }
const RULE_AUTO_SHARE = 0.8;
const RULE_EXAM_PASS = 0.9;
function saveRuleState() { saveJSON(LS_RULES, RULE_STATE); if (window.CloudSync) window.CloudSync.schedulePush(); }
function ruleWordShare(id) {
  const words = buildRuleIndex().byRule[id].words;
  if (!words.length) return 0;
  return words.filter((w) => getProgress(w.en).box >= 3).length / words.length;
}
// learned + как именно: "exam" | "manual" | "words"
function ruleLearnedInfo(id) {
  const st = RULE_STATE[id];
  if (st && st.learned) return st;
  if (st && st.how === "returned") return null;
  const words = buildRuleIndex().byRule[id].words;
  if (words.length >= 3 && ruleWordShare(id) >= RULE_AUTO_SHARE) return { learned: true, how: "words" };
  return null;
}
function markRuleLearned(id, how, score) {
  RULE_STATE[id] = { learned: true, at: Date.now(), how, score: score == null ? null : score };
  saveRuleState();
}
function learnRuleManually(id) {
  const r = RULES.find((x) => x.id === id);
  if (!confirm(`Вычеркнуть правило «${ruleShortTitle(r)}»? Оно уйдёт в «Выучено», вернуть можно в любой момент.`)) return;
  markRuleLearned(id, "manual");
  openRuleId = null;
  renderRules();
}
function returnRule(id) {
  RULE_STATE[id] = { learned: false, at: Date.now(), how: "returned" };
  saveRuleState();
  openRuleId = id;
  renderRules();
}
function ruleLearnedLabel(info) {
  if (!info) return "";
  const when = info.at ? new Date(info.at).toLocaleDateString("ru-RU", { day: "numeric", month: "long" }) : "";
  if (info.how === "exam") return `Сдано на ${info.score}%${when ? " · " + when : ""}`;
  if (info.how === "manual") return `Вычеркнуто вручную${when ? " · " + when : ""}`;
  return "80% слов правила закреплены";
}
function examRule(id) {
  const words = ruleWordsList(id);
  const list = shuffleArray(words).slice(0, Math.min(BATCH_SIZE, words.length)).map((w) => w.en);
  startSessionForWords(list);
  if (SESSION) { SESSION.ruleExam = id; SESSION.examSize = SESSION.queue.length; }
}

let openRuleId = null;
let rulesSearch = "";
function openRule(id) {
  openRuleId = id;
  rulesSearch = "";
  const input = document.getElementById("rules-search");
  if (input) input.value = "";
  showView("rules");
  const el = document.getElementById("rule-" + id);
  if (el) el.scrollIntoView({ block: "start" });
}
function toggleRule(id) {
  openRuleId = openRuleId === id ? null : id;
  renderRules();
  if (openRuleId) {
    const el = document.getElementById("rule-" + id);
    if (el) el.scrollIntoView({ block: "start", behavior: "smooth" });
  }
}
function ruleWordsList(id) { return buildRuleIndex().byRule[id].words; }
function learnRuleWords(id) {
  const words = ruleWordsList(id);
  const fresh = words.filter((w) => getProgress(w.en).total === 0);
  const list = (fresh.length ? fresh : words).slice(0, BATCH_SIZE).map((w) => w.en);
  startLearnForWords(list);
}
function checkRuleWords(id) {
  const now = Date.now();
  const words = ruleWordsList(id);
  const due = words.filter((w) => isDue(getProgress(w.en), now));
  const list = shuffleArray(due.length ? due : words).slice(0, BATCH_SIZE).map((w) => w.en);
  startSessionForWords(list);
}
function ruleWordChipHtml(w) {
  const p = getProgress(w.en);
  const cls = p.box >= 4 ? "mastered" : p.total > 0 ? "learning" : "";
  return `<span class="rule-word ${cls}" data-text="${escapeHtml(w.en)}" onclick="speakEn(this.dataset.text)" title="${escapeHtml(w.ru)}"><b>${escapeHtml(w.en)}</b> — ${escapeHtml(w.ru)}</span>`;
}
function renderRuleBody(rule, entry) {
  const verbHtml = entry.verbGroups.map((g) => `
    <div class="rule-group">
      <div class="rule-group-label">${escapeHtml(g.label)}</div>
      <div class="rule-group-hook">${escapeHtml(g.hook)}</div>
      <table class="verb-table">
        ${g.rows.map((r) => {
          const have = new Set(r.words.map((w) => ruleKey(w.en).split(/\s+/)[0]));
          const cell = (f) => f.split("/").map((x) => x.trim()).map((x) => `<span class="${have.has(x) ? "in-dict" : ""}" data-text="${escapeHtml(x)}" onclick="speakEn(this.dataset.text)">${escapeHtml(x)}</span>`).join(" / ");
          return `<tr><td>${cell(r.verb[0])}</td><td>${cell(r.verb[1])}</td><td>${cell(r.verb[2])}</td><td class="verb-ru">${escapeHtml(r.verb[3])}</td></tr>`;
        }).join("")}
      </table>
    </div>`).join("");
  const groupsHtml = entry.groups.map((g) => `
    <div class="rule-group">
      <div class="rule-group-label">${escapeHtml(g.label)} <span class="rule-count">${g.words.length}</span></div>
      <div class="rule-words">${g.words.map(ruleWordChipHtml).join("")}</div>
    </div>`).join("");
  return `
    <div class="rule-body">${escapeHtml(rule.body).replace(/\n/g, "<br>")}</div>
    ${verbHtml}
    ${groupsHtml}
    ${rule.irregular ? `<div class="rule-legend">Выделены формы, которые уже есть в твоём словаре. Нажми на слово — оно прозвучит.</div>` : `<div class="rule-legend"><i class="sw mastered"></i>закреплено · <i class="sw learning"></i>учится. Нажми на слово — оно прозвучит.</div>`}
    <div class="settings-row" style="margin-top:12px;">
      <button class="small-btn learn-btn" onclick="learnRuleWords('${rule.id}')">${ico("book-2")} Изучить</button>
      <button class="small-btn" onclick="checkRuleWords('${rule.id}')">${ico("pencil")} Проверить себя</button>
      ${rule.id === "phrasal" ? `<button class="small-btn" onclick="showView('phrasal')">${ico("puzzle")} Тренажёр с предложениями</button>` : ""}
    </div>
    ${(() => {
      const info = ruleLearnedInfo(rule.id);
      const share = Math.round(ruleWordShare(rule.id) * 100);
      if (info) return `<div class="rule-learned-box">
          <div>${ico("check")} <b>Выучено.</b> ${escapeHtml(ruleLearnedLabel(info))}</div>
          <button class="small-btn" onclick="returnRule('${rule.id}')">${ico("refresh")} Вернуть в изучение</button>
        </div>`;
      return `<div class="rule-learned-box todo">
          <div>Правило вычеркнется, когда ты его знаешь: сдай экзамен на 90% — или закрепи 80% слов (сейчас ${share}%).</div>
          <div class="progressbar-outer"><div class="progressbar-inner" style="width:${Math.min(100, Math.round(share / RULE_AUTO_SHARE))}%"></div></div>
          <div class="settings-row">
            <button class="small-btn learn-btn" onclick="examRule('${rule.id}')">${ico("target")} Сдать правило</button>
            <button class="small-btn" onclick="learnRuleManually('${rule.id}')">${ico("check")} Знаю — вычеркнуть</button>
          </div>
        </div>`;
    })()}`;
}
function renderRules() {
  const el = document.getElementById("rules-list");
  if (!el) return;
  const idx = buildRuleIndex();
  const q = rulesSearch.trim().toLowerCase();
  let rules = RULES.filter((r) => idx.byRule[r.id].words.length);
  if (q) {
    rules = rules.filter((r) =>
      r.title.toLowerCase().includes(q) || r.hook.toLowerCase().includes(q) ||
      idx.byRule[r.id].words.some((w) => w.en.toLowerCase().includes(q) || w.ru.toLowerCase().includes(q)));
  }
  const covered = Object.keys(idx.byWord).length;
  const allVisible = RULES.filter((r) => idx.byRule[r.id].words.length);
  const learnedCount = allVisible.filter((r) => ruleLearnedInfo(r.id)).length;
  document.getElementById("rules-summary").textContent =
    `${RULES.length} ${plural(RULES.length, "правило", "правила", "правил")} · в них ${covered} из ${WORDS_DATA.length} твоих слов` +
    (learnedCount ? ` · выучено ${learnedCount}` : "");
  if (!rules.length) { el.innerHTML = `<div class="empty-state">Ничего не найдено</div>`; return; }
  const card = (r) => {
    const entry = idx.byRule[r.id];
    const info = ruleLearnedInfo(r.id);
    const open = openRuleId === r.id || (q && rules.length <= 3);
    const mastered = entry.words.filter((w) => getProgress(w.en).box >= 4).length;
    return `<div class="card rule-card ${open ? "open" : ""} ${info ? "learned" : ""}" id="rule-${r.id}">
      <button type="button" class="rule-head" onclick="toggleRule('${r.id}')" aria-expanded="${open ? "true" : "false"}">
        <span class="toc-line"><span class="rule-title">${escapeHtml(r.title)}</span><span class="toc-leader" aria-hidden="true"></span><span class="rule-meta">${info ? ico("check") : entry.words.length}</span></span>
        ${info && !open ? "" : `<span class="rule-hook">${escapeHtml(r.hook)}</span>`}
        <span class="rule-sub">${info ? escapeHtml(ruleLearnedLabel(info)) : `${entry.words.length} ${plural(entry.words.length, "слово", "слова", "слов")} из словаря${mastered ? ` · закреплено ${mastered}` : ""}`}</span>
      </button>
      ${open ? renderRuleBody(r, entry) : ""}
    </div>`;
  };
  const active = rules.filter((r) => !ruleLearnedInfo(r.id));
  const learned = rules.filter((r) => ruleLearnedInfo(r.id));
  el.innerHTML = active.map(card).join("") +
    (learned.length ? `<h2 class="section-title rules-learned-title">${ico("check")} Выучено · ${learned.length}</h2>${learned.map(card).join("")}` : "");
}

/* ============ Ошибки из Duolingo ============ */
const MISTAKE_TYPES = { "to-en": "Перевод на английский", "to-ru": "Перевод на русский", gap: "Вставить слово", listen: "Аудирование", dialog: "Диалог" };
// ошибки из Duolingo + ошибки из диалогов в приложении
function allMistakes() {
  const fromDialog = typeof DIALOG_MISTAKES !== "undefined" ? DIALOG_MISTAKES : [];
  return [...fromDialog, ...(typeof MISTAKES !== "undefined" ? MISTAKES : [])];
}
let duoTab = "lessons";
let openMistakeId = null;
function setDuoTab(tab) {
  duoTab = tab;
  document.querySelectorAll("#duo-tabs .filter-chip").forEach((el) => el.classList.toggle("active", el.dataset.tab === tab));
  document.getElementById("duo-tab-lessons").style.display = tab === "lessons" ? "" : "none";
  document.getElementById("duo-tab-mistakes").style.display = tab === "mistakes" ? "" : "none";
  document.getElementById("duo-tab-phrases").style.display = tab === "phrases" ? "" : "none";
  if (tab === "mistakes") renderMistakes();
  if (tab === "phrases") renderKeyPhrases();
}
function toggleMistake(id) {
  openMistakeId = openMistakeId === id ? null : id;
  renderMistakes();
}
function mistakeWords(m) {
  return (m.words || []).map((s) => WORDS_DATA.find((w) => normKey(w.en) === normKey(s)) || WORDS_DATA.find((w) => ruleKey(w.en) === ruleKey(s))).filter(Boolean);
}
function practiceMistakeWords(id) {
  const list = id ? allMistakes().filter((m) => m.id === id) : allMistakes();
  const words = [...new Set(list.flatMap(mistakeWords).map((w) => w.en))];
  if (!words.length) { alert("В этих ошибках нет слов из твоего словаря."); return; }
  startSessionForWords(words.slice(0, 40));
}
function renderMistakes() {
  const el = document.getElementById("mistakes-list");
  if (!el) return;
  if (!allMistakes().length) {
    el.innerHTML = `<div class="empty-state">Ошибок пока нет. Попроси «разбери мои ошибки в дуолинго» — и они появятся здесь с объяснением.</div>`;
    return;
  }
  const items = [...allMistakes()].sort((a, b) => b.date.localeCompare(a.date)); // при равной дате сохраняем порядок: сначала ошибки из диалогов
  // какие правила встречаются в ошибках чаще всего — это «слабые места»
  const freq = {};
  for (const m of items) for (const r of m.rules || []) freq[r] = (freq[r] || 0) + 1;
  const weak = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([id, n]) => { const r = RULES.find((x) => x.id === id); return r ? `<span class="rule-chip" onclick="openRule('${id}')">${escapeHtml(ruleShortTitle(r))} ×${n}</span>` : ""; }).join("");
  const head = `<div class="card" style="margin-bottom:12px;">
      <h2 class="block-title">Твои слабые места</h2>
      <div style="font-size:12.5px;color:var(--muted);margin:4px 0 6px;">Правила, на которых ты ошибаешься чаще всего. Нажми — откроется правило.</div>
      <div>${weak}</div>
      <button class="small-btn learn-btn" style="margin-top:10px;" onclick="practiceMistakeWords()">${ico("pencil")} Повторить слова из всех ошибок</button>
    </div>`;
  el.innerHTML = head + items.map((m) => {
    const open = openMistakeId === m.id;
    const rulesHtml = (m.rules || []).map((id) => {
      const r = RULES.find((x) => x.id === id);
      if (!r) return "";
      return `<div class="mistake-rule" onclick="event.stopPropagation(); openRule('${id}')">
        <div class="rule-hint-title">${escapeHtml(r.title)}</div>
        <div>${escapeHtml(r.hook)}</div>
      </div>`;
    }).join("");
    const words = mistakeWords(m);
    return `<div class="card mistake-card ${open ? "open" : ""}" onclick="toggleMistake('${m.id}')">
      <div class="mistake-meta">${formatDateRu(m.date)} · ${MISTAKE_TYPES[m.type] || ""}</div>
      ${m.context ? `<div class="mistake-context">Собеседник: «${escapeHtml(m.context)}»</div>` : ""}
      <div class="mistake-prompt">${escapeHtml(m.prompt)}</div>
      ${m.yours ? `<div class="mistake-line bad">${ico("x")} ${escapeHtml(m.yours)}</div>` : `<div class="mistake-line muted">Твой ответ Duolingo не сохранил</div>`}
      <div class="mistake-line good">${ico("check")} ${escapeHtml(m.correct)} <span class="inline-speak">${m.type === "to-en" || m.type === "gap" ? speakButtonHtml(m.correct) : speakButtonHtml(m.prompt)}</span></div>
      ${open ? `
        <div class="mistake-why">
          <div class="rule-group-label">Почему так</div>
          <ul>${m.why.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
        </div>
        ${rulesHtml ? `<div class="rule-group-label" style="margin-top:10px;">Правило</div>${rulesHtml}` : ""}
        ${words.length ? `<div class="rule-words" style="margin-top:10px;">${words.map(ruleWordChipHtml).join("")}</div>
          <button class="small-btn" style="margin-top:10px;" onclick="event.stopPropagation(); practiceMistakeWords('${m.id}')">${ico("pencil")} Повторить эти слова</button>` : ""}
      ` : `<div class="mistake-more">Почему так ${ico("chevron-right")}</div>`}
    </div>`;
  }).join("");
}

/* ============ Тренажёр фразовых глаголов ============ */
const PARTICLE_OPTIONS = ["up", "out", "off", "on", "down", "back", "away", "over", "in", "for", "after", "at", "with", "into", "along", "around", "together", "from", "of", "to"];
let phrasalSearch = "";
function phrasalWord(ph) { return WORDS_DATA.find((w) => normKey(w.en) === normKey(ph.en)) || null; }
// "{gave up}" → предложение с пропуском и правильный ответ
function phrasalGap(sentence) {
  const parts = [];
  const gapped = sentence.replace(/\{([^}]+)\}/g, (_, g) => { parts.push(g); return "____"; });
  return { gapped, answer: parts.join(" "), plain: sentence.replace(/[{}]/g, "") };
}
function phrasalHighlight(sentence) {
  return escapeHtml(sentence).replace(/\{([^}]+)\}/g, "<b class=\"ph-hl\">$1</b>");
}
function particleOf(ph) { return ph.p; }
function phrasalBase(ph) {
  // глагол без частицы: give up → give, cut down on → cut … on
  return ph.en.split(" ").map((x) => (x === ph.p ? "___" : x)).join(" ");
}
function buildPhrasalQueue(kind) {
  const now = Date.now();
  const scored = PHRASALS.map((ph) => ({ ph, p: getProgress(ph.en) }));
  scored.sort((a, b) => {
    if (a.p.lastWrong !== b.p.lastWrong) return a.p.lastWrong ? -1 : 1;
    const ad = isDue(a.p, now), bd = isDue(b.p, now);
    if (ad !== bd) return ad ? -1 : 1;
    return a.p.box - b.p.box;
  });
  const pool = shuffleArray(scored.slice(0, 20)).slice(0, 10);
  return pool.map((x) => ({ ph: x.ph, kind: kind === "mix" ? (Math.random() < 0.5 ? "gap" : "particle") : kind, ex: x.ph.ex[Math.floor(Math.random() * x.ph.ex.length)] }));
}
function startPhrasalSession(kind) {
  SESSION = {
    mode: "phrasal", queue: buildPhrasalQueue(kind), idx: 0, correctCount: 0, revealed: false,
    typedChecked: false, typedValue: "", typedCorrect: null, chosen: null, options: null,
  };
  document.getElementById("session-overlay").style.display = "flex";
  renderCard();
}
function particleOptionsFor(ph) {
  const others = shuffleArray(PARTICLE_OPTIONS.filter((x) => x !== ph.p && ["up", "out", "off", "on", "down", "back", "away", "over", "in", "for"].includes(x))).slice(0, 3);
  return shuffleArray([ph.p, ...others]);
}
function renderPhrasalCard() {
  const item = currentItem();
  const ph = item.ph;
  const g = phrasalGap(item.ex[0]);
  const revealed = SESSION.revealed;
  const meaning = PARTICLE_MEANING[ph.p] ? `<b>${ph.p.toUpperCase()}</b> — ${escapeHtml(PARTICLE_MEANING[ph.p])}` : "";
  let body = "";
  if (item.kind === "particle") {
    if (!SESSION.options) SESSION.options = particleOptionsFor(ph);
    body = `
      <div class="dir-badge learn-badge">Какая частица?</div>
      <div class="es-word">${escapeHtml(revealed ? ph.en : phrasalBase(ph))}</div>
      <div class="ru-word">${escapeHtml(ph.ru)}</div>
      <div class="particle-options">${SESSION.options.map((o) => {
        let cls = "";
        if (revealed) cls = o === ph.p ? "right" : o === SESSION.chosen ? "wrong" : "";
        return `<button class="particle-btn ${cls}" ${revealed ? "disabled" : ""} onclick="choosePhrasalParticle('${o}')">${o}</button>`;
      }).join("")}</div>`;
  } else {
    body = `
      <div class="dir-badge learn-badge">Впиши сочетание</div>
      <div class="ph-sentence">${revealed ? phrasalHighlight(item.ex[0]) : escapeHtml(g.gapped)}</div>
      <div class="ru-word" style="font-size:15px;">${escapeHtml(item.ex[1])}</div>
      <div class="ph-hint">${ico("bulb")} ${escapeHtml(ph.ru)}</div>`;
  }
  let feedback = "";
  if (revealed) {
    const ok = SESSION.typedCorrect;
    const said = item.kind === "particle" ? SESSION.chosen : SESSION.typedValue;
    feedback = ok
      ? `<div class="typed-feedback good">${ico("check")} Верно</div>`
      : `<div class="typed-feedback bad">${ico("x")} ${said ? `Твой ответ: «${escapeHtml(said)}»` : "Пропущено"}. Правильно: <b>${escapeHtml(item.kind === "particle" ? ph.p : g.answer)}</b></div>`;
    const other = ph.ex.filter((e) => e !== item.ex);
    feedback += `<div class="ph-explain">
      ${meaning ? `<div>${meaning}</div>` : ""}
      <div style="margin-top:6px;">${phrasalHighlight(item.ex[0])} <span class="muted">— ${escapeHtml(item.ex[1])}</span></div>
      ${other.map((e) => `<div style="margin-top:4px;">${phrasalHighlight(e[0])} <span class="muted">— ${escapeHtml(e[1])}</span></div>`).join("")}
    </div>`;
  }
  document.getElementById("flash-area").innerHTML = `
    <div class="flash-wrap">
      <div class="flashcard">
        ${speakButtonHtml(revealed ? g.plain : ph.en, "card-speak-btn")}
        ${body}
        ${feedback}
      </div>
      ${!revealed && item.kind === "gap" ? `
        <div class="type-answer-row">
          <input type="text" id="type-answer-input" class="type-answer-input" placeholder="Например: give up" autocomplete="off" autocapitalize="off" spellcheck="false">
          ${micAnswerButtonHtml("en-US")}
          <button class="check-btn" onclick="checkTyped()">Проверить</button>
        </div>` : ""}
      ${revealed ? `<button class="reveal-btn" onclick="nextCard()">Далее</button>` : ""}
    </div>`;
  if (!revealed && item.kind === "gap") { const input = document.getElementById("type-answer-input"); if (input) input.focus({ preventScroll: true }); }
}
function finishPhrasalAnswer(correct) {
  const item = currentItem();
  SESSION.typedCorrect = correct;
  SESSION.revealed = true;
  registerReview(item.ph.en, correct);
  if (typeof reviewTrack === "function") reviewTrack("p:" + item.ph.en, correct);
  if (correct) SESSION.correctCount++;
  else if (SESSION.queue.filter((x) => x.ph === item.ph).length < 2) {
    const at = Math.min(SESSION.queue.length, SESSION.idx + 4);
    SESSION.queue.splice(at, 0, { ph: item.ph, kind: item.kind === "gap" ? "particle" : "gap", ex: item.ex });
  }
  renderCard();
  speakEn(phrasalGap(item.ex[0]).plain);
}
function choosePhrasalParticle(o) {
  if (SESSION.revealed) return;
  SESSION.chosen = o;
  finishPhrasalAnswer(o === currentItem().ph.p);
}
function checkPhrasalGap() {
  const input = document.getElementById("type-answer-input");
  const value = input ? input.value.trim() : "";
  const item = currentItem();
  const norm = (s) => normalizeAnswer(s, true).replace(/\s+/g, " ");
  const v = norm(value);
  const g = phrasalGap(item.ex[0]);
  const ok = !!v && (v === norm(g.answer) || v === norm(item.ph.en));
  SESSION.typedValue = value;
  SESSION.typedChecked = true;
  finishPhrasalAnswer(ok);
}
function renderPhrasalPage() {
  const legend = document.getElementById("particle-legend");
  if (legend && !legend.innerHTML) {
    legend.innerHTML = ["up", "out", "off", "on", "down", "back", "away", "over", "in"].map((p) =>
      `<span class="particle-pill"><b>${p.toUpperCase()}</b> ${escapeHtml(PARTICLE_MEANING[p])}</span>`).join("");
  }
  const el = document.getElementById("phrasal-list");
  const q = phrasalSearch.trim().toLowerCase();
  const items = PHRASALS.filter((ph) => !q || ph.en.includes(q) || ph.ru.toLowerCase().includes(q));
  const groups = {};
  for (const ph of items) (groups[ph.p] = groups[ph.p] || []).push(ph);
  el.innerHTML = Object.entries(groups).map(([p, list]) => `
    <div class="section-title">${p.toUpperCase()}${PARTICLE_MEANING[p] ? ` — ${escapeHtml(PARTICLE_MEANING[p])}` : ""}</div>
    ${list.map((ph) => {
      const pr = getProgress(ph.en);
      const dots = Array.from({ length: 5 }, (_, i) => `<span class="dot ${i < pr.box ? "on" : ""}"></span>`).join("");
      return `<div class="card ph-card">
        <div class="ph-card-head">
          <div><b>${escapeHtml(ph.en)}</b>${ph.extra ? ` <span class="src-badge puzzle">новое</span>` : ""} — ${escapeHtml(ph.ru)}</div>
          <div class="box-dots">${dots}</div>
          ${speakButtonHtml(ph.en)}
        </div>
        ${ph.ex.map((e) => `<div class="ph-ex" data-text="${escapeHtml(e[0].replace(/[{}]/g, ""))}" onclick="speakEn(this.dataset.text)">${phrasalHighlight(e[0])}<div class="muted">${escapeHtml(e[1])}</div></div>`).join("")}
      </div>`;
    }).join("")}`).join("") || `<div class="empty-state">Ничего не найдено</div>`;
}

/* ============ Ключевые фразы разделов Duolingo ============ */
let kpLevel = "all";
let kpSearch = "";
let kpOpenUnit = null;
const KP_LEVELS = [["all", "Все"], ["B1", "B1"], ["A2", "A2"], ["A1", "A1"], ["Intro", "Начало"]];
function kpAll() {
  if (typeof KEY_PHRASES === "undefined") return [];
  const out = [];
  for (const u of KEY_PHRASES) for (const [en, ru] of u.phrases) out.push({ en, ru, unit: u });
  return out;
}
// сравнение предложений: сокращения раскрываем, пунктуацию убираем
// сокращения, которые на телефоне часто пишут без апострофа
const KP_NO_APOSTROPHE = {
  dont: "do not", doesnt: "does not", didnt: "did not", isnt: "is not", arent: "are not", wasnt: "was not", werent: "were not",
  cant: "can not", couldnt: "could not", shouldnt: "should not", wouldnt: "would not", wont: "will not",
  havent: "have not", hasnt: "has not", hadnt: "had not", mustnt: "must not",
  im: "i am", ive: "i have", youre: "you are", theyre: "they are", weve: "we have", youve: "you have", theyve: "they have",
  youll: "you will", itll: "it will", theyll: "they will",
  lets: "let us", thats: "that is", whats: "what is", wheres: "where is", hows: "how is", heres: "here is", theres: "there is",
};
// слова, пропуск которых не считаем ошибкой
const KP_SOFT = new Set(["a", "an", "the", "that", "so", "very", "really", "just", "please", "oh", "wow", "hey"]);
function kpTokens(s) {
  return String(s).toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/\bcan't\b/g, "can not").replace(/\bwon't\b/g, "will not").replace(/\bshan't\b/g, "shall not")
    .replace(/n't\b/g, " not").replace(/'m\b/g, " am").replace(/'re\b/g, " are").replace(/'ve\b/g, " have")
    .replace(/'ll\b/g, " will").replace(/'d\b/g, " would")
    .replace(/\b(it|that|what|where|who|there|here|he|she|how|let)'s\b/g, (m, w) => (w === "let" ? "let us" : w + " is"))
    .replace(/[^a-z0-9' -]/g, " ").replace(/-/g, " ")
    .split(/\s+/).filter(Boolean)
    .flatMap((t) => (KP_NO_APOSTROPHE[t] ? KP_NO_APOSTROPHE[t].split(" ") : [t]));
}
function kpCompare(user, correct) {
  const a = kpTokens(user), b = kpTokens(correct);
  // LCS по словам: какие слова правильного ответа совпали
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--)
    dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const matched = new Set();
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { matched.add(j); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  const lcs = dp[0][0];
  const ratio = b.length ? lcs / Math.max(a.length, b.length) : 0;
  const missing = b.filter((_, k) => !matched.has(k));
  const extra = a.length - lcs;
  // верно: все важные слова на месте (пропущены только мелкие) и почти нет лишних
  const ok = b.length > 0 && missing.every((w) => KP_SOFT.has(w)) && missing.length <= 2 && extra <= 1;
  return { ok, close: ratio >= 0.6, ratio, missing };
}
// правильный ответ с подсветкой слов, которых не было в ответе
function kpHighlight(correct, missing) {
  const miss = new Set(missing);
  return String(correct).split(/(\s+)/).map((chunk) => {
    if (/^\s+$/.test(chunk)) return chunk;
    const toks = kpTokens(chunk);
    const isMissing = toks.length && toks.some((t) => miss.has(t));
    return isMissing ? `<b class="ph-hl">${escapeHtml(chunk)}</b>` : escapeHtml(chunk);
  }).join("");
}
function buildKeyPhraseQueue(list, n) {
  const now = Date.now();
  const scored = list.map((x) => ({ x, p: getProgress(x.en) }));
  scored.sort((a, b) => {
    if (a.p.lastWrong !== b.p.lastWrong) return a.p.lastWrong ? -1 : 1;
    const ad = isDue(a.p, now), bd = isDue(b.p, now);
    if (ad !== bd) return ad ? -1 : 1;
    if (a.p.total !== b.p.total) return a.p.total - b.p.total;
    return b.x.unit.unit - a.x.unit.unit; // свежие разделы — раньше
  });
  return shuffleArray(scored.slice(0, Math.max(n * 2, n)).map((s) => s.x)).slice(0, n);
}
function startKeyPhraseSession(unitIdx) {
  let list = kpAll();
  if (unitIdx !== undefined) list = list.filter((x) => x.unit.unit === unitIdx);
  else if (kpLevel !== "all") list = list.filter((x) => x.unit.cefr === kpLevel);
  if (!list.length) { alert("Нет фраз для тренировки."); return; }
  const queue = unitIdx !== undefined ? shuffleArray(list) : buildKeyPhraseQueue(list, 10);
  SESSION = { mode: "keyphrase", queue: queue.map((x) => ({ kp: x })), idx: 0, correctCount: 0, revealed: false, typedChecked: false, typedValue: "", typedCorrect: null };
  document.getElementById("session-overlay").style.display = "flex";
  renderCard();
}
function renderKeyPhraseCard() {
  const { kp } = currentItem();
  const revealed = SESSION.revealed;
  let feedback = "";
  if (revealed) {
    const r = SESSION.kpResult;
    feedback = r.ok
      ? `<div class="typed-feedback good">${ico("check")} Верно${r.ratio < 1 ? " (мелкие расхождения не считаем)" : ""}</div>`
      : `<div class="typed-feedback bad">${ico("x")} ${SESSION.typedValue ? `Твой ответ: «${escapeHtml(SESSION.typedValue)}»` : "Пропущено"}${r.close ? " — почти!" : ""}</div>`;
    feedback += `<div class="ph-explain">
      <div class="ph-sentence" style="margin:0;">${kpHighlight(kp.en, r.ok ? [] : r.missing)}</div>
      ${!r.ok && r.missing.length ? `<div class="muted" style="margin-top:6px;">Выделены слова, которых не было в твоём ответе.</div>` : ""}
    </div>`;
  }
  document.getElementById("flash-area").innerHTML = `
    <div class="flash-wrap">
      <div class="flashcard">
        ${revealed ? speakButtonHtml(kp.en, "card-speak-btn") : ""}
        <div class="dir-badge learn-badge">Переведи на английский</div>
        <div class="ph-sentence">${escapeHtml(kp.ru)}</div>
        <div class="ph-hint">${escapeHtml(kp.unit.title.split(" / ")[0])} · ${escapeHtml(kp.unit.cefr)}</div>
        ${feedback}
      </div>
      ${!revealed ? `
        <div class="type-answer-row">
          <input type="text" id="type-answer-input" class="type-answer-input" placeholder="Фраза по-английски…" autocomplete="off" autocapitalize="off" spellcheck="false">
          ${micAnswerButtonHtml("en-US")}
          <button class="check-btn" onclick="checkTyped()">Проверить</button>
        </div>` : `<button class="reveal-btn" onclick="nextCard()">Далее</button>`}
    </div>`;
  if (!revealed) { const input = document.getElementById("type-answer-input"); if (input) input.focus({ preventScroll: true }); }
}
function checkKeyPhrase() {
  const input = document.getElementById("type-answer-input");
  const value = input ? input.value.trim() : "";
  const item = currentItem();
  const r = kpCompare(value, item.kp.en);
  SESSION.kpResult = r;
  SESSION.typedValue = value;
  SESSION.typedChecked = true;
  SESSION.typedCorrect = r.ok;
  SESSION.revealed = true;
  registerReview(item.kp.en, r.ok);
  if (typeof reviewTrack === "function") reviewTrack("k:" + item.kp.en, r.ok);
  if (r.ok) SESSION.correctCount++;
  else if (SESSION.queue.filter((x) => x.kp === item.kp).length < 2) {
    SESSION.queue.splice(Math.min(SESSION.queue.length, SESSION.idx + 4), 0, { kp: item.kp });
  }
  renderCard();
  speakEn(item.kp.en);
}
function toggleKpUnit(idx) {
  kpOpenUnit = kpOpenUnit === idx ? null : idx;
  renderKeyPhrases();
}
function setKpLevel(level) {
  kpLevel = level;
  renderKeyPhrases();
}
function renderKeyPhrases() {
  const el = document.getElementById("kp-list");
  if (!el || typeof KEY_PHRASES === "undefined") return;
  const total = kpAll().length;
  const btn = document.getElementById("kp-train-btn");
  if (btn) btn.innerHTML = `${ico("pencil")} Тренировать 10 фраз${kpLevel !== "all" ? ` (${kpLevel === "Intro" ? "начало" : kpLevel})` : ""}`;
  document.getElementById("kp-levels").innerHTML = KP_LEVELS.map(([k, label]) =>
    `<button type="button" class="filter-chip ${kpLevel === k ? "active" : ""}" onclick="setKpLevel('${k}')">${label}</button>`).join("");
  const q = kpSearch.trim().toLowerCase();
  let units = [...KEY_PHRASES].sort((a, b) => b.unit - a.unit);
  if (kpLevel !== "all") units = units.filter((u) => u.cefr === kpLevel);
  if (q) units = units.filter((u) => u.title.toLowerCase().includes(q) || u.phrases.some(([en, ru]) => en.toLowerCase().includes(q) || ru.toLowerCase().includes(q)));
  const learned = kpAll().filter((x) => getProgress(x.en).box >= 1).length;
  el.innerHTML = `<p class="block-note">${KEY_PHRASES.length} ${plural(KEY_PHRASES.length, "раздел", "раздела", "разделов")} · ${total} фраз · выучено ${learned}</p>` +
    (units.map((u) => {
      const open = kpOpenUnit === u.unit || (q && units.length <= 5);
      const done = u.phrases.filter(([en]) => getProgress(en).box >= 1).length;
      return `<div class="card kp-unit ${open ? "open" : ""}">
        <div class="kp-head" onclick="toggleKpUnit(${u.unit})">
          <div style="flex:1;min-width:0;">
            <div class="kp-title">${escapeHtml(u.title.split(" / ")[0])}</div>
            <div class="block-note" style="margin:2px 0 0;">${escapeHtml(u.cefr)} · ${done}/${u.phrases.length} выучено</div>
          </div>
          ${ico(open ? "x" : "chevron-right")}
        </div>
        ${open ? `
          ${u.phrases.map(([en, ru]) => `<div class="kp-phrase">
            <div style="flex:1;min-width:0;"><div class="kp-en">${escapeHtml(en)}</div><div class="kp-ru">${escapeHtml(ru)}</div></div>
            ${speakButtonHtml(en)}
          </div>`).join("")}
          <button class="small-btn learn-btn" style="margin-top:10px;" onclick="startKeyPhraseSession(${u.unit})">${ico("pencil")} Тренировать раздел</button>
        ` : ""}
      </div>`;
    }).join("") || `<div class="empty-state">Ничего не найдено</div>`);
}

/* ============ helpers ============ */
// иконка из SVG-спрайта в index.html (Tabler Icons, MIT)
function ico(name, cls) {
  return `<svg class="ico${cls ? " " + cls : ""}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
}
function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ============ настройки: экспорт/импорт/сброс ============ */
function exportData() {
  const blob = new Blob([JSON.stringify({ PROGRESS, HISTORY, STREAK, RULE_STATE, REVIEW_STATE, DIARY, BACKLOG, PUZZLE }, null, 2)], { type: "application/json" });
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
      if (data.RULE_STATE) { RULE_STATE = data.RULE_STATE; saveRuleState(); }
      if (data.REVIEW_STATE) REVIEW_STATE = data.REVIEW_STATE;
      if (data.DIARY) DIARY = data.DIARY;
      if (data.BACKLOG) BACKLOG = data.BACKLOG;
      if (data.PUZZLE && Array.isArray(data.PUZZLE.lessons)) { PUZZLE = data.PUZZLE; savePuzzle(); mergePuzzleNotes(); }
      saveReviewData();
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
  document.getElementById("nav-texts").addEventListener("click", () => showView("texts"));
  document.getElementById("nav-puzzle").addEventListener("click", () => { puzzleOpenNote = null; showView("puzzle"); });
  document.getElementById("nav-diary").addEventListener("click", () => showView("diary"));
  document.getElementById("nav-archive").addEventListener("click", () => showView("archive"));

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
  document.getElementById("rules-search").addEventListener("input", (e) => { rulesSearch = e.target.value; renderRules(); });
  document.getElementById("phrasal-search").addEventListener("input", (e) => { phrasalSearch = e.target.value; renderPhrasalPage(); });
  document.querySelectorAll("#duo-tabs .filter-chip").forEach((el) => el.addEventListener("click", () => setDuoTab(el.dataset.tab)));
  document.getElementById("kp-search").addEventListener("input", (e) => { kpSearch = e.target.value; renderKeyPhrases(); });


  document.getElementById("btn-export").addEventListener("click", exportData);
  document.getElementById("btn-reset").addEventListener("click", resetProgress);
  document.getElementById("import-file").addEventListener("change", (e) => {
    if (e.target.files[0]) importData(e.target.files[0]);
  });

  showView("home");
});
