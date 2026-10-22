/* ============ Обновление из Duolingo и Puzzle English — без Claude ============
   Закладка («букмарклет») запускается на duolingo.com или puzzle-english.com, где ты
   уже вошла в аккаунт: собирает свежие слова, ошибки и ключевые фразы разделов,
   сжимает их и открывает приложение с данными в «хвосте» адреса (#import=…, эта часть
   адреса не уходит ни на какой сервер). Приложение находит, чего ещё нет, переводит
   слова и разбирает ошибки через твой ключ Gemini (без ключа — переводы Duolingo и
   короткие подсказки), создаёт день изучения, и он попадает в расписание повторов.
   Всё импортированное хранится в браузере и синхронизируется через Firebase. */

const LS_IMPORTED = "enapp_imported_v1";
const IMPORT_BASELINE_UNIT = 211; // разделы Duolingo до этого номера уже разобраны вручную
let IMPORTED = (() => {
  try { return JSON.parse(localStorage.getItem(LS_IMPORTED)) || null; } catch (e) { return null; }
})() || { words: [], mistakes: [], log: [], units: [], meta: {} };

function importKey(s) {
  return String(s).toLowerCase().replace(/[’‘`]/g, "'").replace(/^(to|a|an|the)\s+(?=\S)/, "").replace(/[.!?]+$/, "").replace(/\s+/g, " ").trim();
}
// импортированное добавляется к данным приложения при каждом запуске
function mergeImported() {
  const have = new Set(WORDS_DATA.map((w) => importKey(w.en)));
  let maxId = WORDS_DATA.reduce((m, w) => Math.max(m, w.id), 0);
  for (const w of IMPORTED.words) {
    const k = importKey(w.en);
    if (have.has(k)) continue;
    have.add(k);
    const item = { en: w.en, ru: w.ru, src: w.src, id: ++maxId };
    if (w.tr) item.tr = w.tr;
    WORDS_DATA.unshift(item);
  }
  for (const m of IMPORTED.mistakes) if (!MISTAKES.some((x) => x.id === m.id)) MISTAKES.unshift(m);
  for (const e of IMPORTED.log) if (!DUO_LOG.some((x) => x.id === e.id)) DUO_LOG.unshift(e);
  for (const u of IMPORTED.units) if (!KEY_PHRASES.some((x) => x.unit === u.unit)) KEY_PHRASES.push(u);
}
mergeImported();

function saveImported() {
  try { localStorage.setItem(LS_IMPORTED, JSON.stringify(IMPORTED)); } catch (e) {}
  if (window.CloudSync) window.CloudSync.schedulePush();
}
// после добавления данных сбрасываем кэши, построенные по старым данным
function resetDataCaches() {
  if (typeof RULE_INDEX !== "undefined") RULE_INDEX = null;
  if (typeof KNOWN_SET !== "undefined") KNOWN_SET = null;
  if (typeof DIALOG_VOCAB !== "undefined") DIALOG_VOCAB = null;
}

function appBaseUrl() { return location.origin + location.pathname.replace(/index\.html$/, ""); }
// закладка — короткий загрузчик: подключает collector.js с сайта приложения
function bookmarkletHref() {
  return "javascript:(function(){var s=document.createElement('script');s.src='" + appBaseUrl() + "collector.js?'+Date.now();document.body.appendChild(s);})()";
}

/* ---------- приём данных в приложении ---------- */
async function decodeImport(b64) {
  let s = b64.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const text = await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
  return JSON.parse(text);
}
function dateOfTs(ts) {
  const d = new Date(ts);
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}
function mistakeTypeOf(k) {
  if (/reverse|complete_reverse/.test(k)) return "to-en";
  if (/listen/.test(k)) return "listen";
  if (/gap|complete|cloze|fill/.test(k)) return "gap";
  if (/^tap$|translate|tap/.test(k)) return "to-ru";
  return null;
}
function looseText(s) { return String(s).toLowerCase().replace(/[^a-zа-яё0-9]+/gi, " ").trim(); }

async function aiTranslateWords(list) {
  if (!list.length || !loadAiKey()) return {};
  const prompt = `Переведи английские слова и фразы на русский для карточек ученицы (уровень A2–B1).
Для каждого: 1–3 самых частых перевода через запятую, в словарной форме (существительные — в именительном падеже, глаголы — в инфинитиве).
Формы неправильных глаголов — перевод и в скобках исходный глагол, например «went»: «пошёл, ходил (прош. от go)».
В подсказке — переводы Duolingo (часто в неудачной форме), используй их только как подсказку смысла.
${list.map(([en, hint]) => `${en} — ${hint}`).join("\n")}
Ответь СТРОГО JSON-объектом без markdown: {"английское слово": "перевод", ...}`;
  try { return parseJsonLoose(await callGeminiRaw(prompt, true)); } catch (e) { return {}; }
}
async function aiExplainMistakes(list) {
  if (!list.length || !loadAiKey()) return [];
  const rules = RULES.map((r) => `${r.id} — ${r.title.split(":")[0]}`).join("; ");
  const typeName = { "to-en": "перевод на английский", "to-ru": "перевод на русский", gap: "вставить слово", listen: "аудирование" };
  const prompt = `Ты — мудрый и добрый учитель английского для русскоговорящей ученицы (A2–B1). Разбери её ошибки из Duolingo.
Для каждой ошибки дай:
- why: 1–3 коротких пункта по-русски: что не так и ПОЧЕМУ так, а не иначе (простое правило + пример), по-доброму, без занудства; если часть ответа верна — отметь это;
- rules: 0–2 id подходящих правил из списка;
- words: 1–4 английских слова или выражения из правильного ответа, которые стоит повторить.
Список правил (id — название): ${rules}
Ошибки:
${list.map((m, i) => `${i + 1}) ${typeName[m.type]}. Задание: «${m.prompt}». Её ответ: «${m.yours}». Правильно: «${m.correct}».`).join("\n")}
Ответь СТРОГО JSON-массивом без markdown, в том же порядке: [{"why": ["..."], "rules": ["id"], "words": ["..."]}, ...]`;
  try {
    const res = parseJsonLoose(await callGeminiRaw(prompt, true).then((t) => {
      const s = String(t); const a = s.indexOf("["), b = s.lastIndexOf("]");
      return a >= 0 && b > a ? `{"items": ${s.slice(a, b + 1)}}` : s;
    }));
    return res.items || [];
  } catch (e) { return []; }
}

async function processDuoImport(data, step) {
  const today = todayStr();
  const have = new Set(WORDS_DATA.map((w) => importKey(w.en)));
  const fresh = [];
  for (const [en, hint] of data.words || []) {
    const k = importKey(en);
    if (!k || have.has(k)) continue;
    have.add(k);
    fresh.push([en, hint || ""]);
  }
  step(`Новых слов: ${fresh.length}${fresh.length && loadAiKey() ? " — перевожу…" : ""}`);
  const tr = await aiTranslateWords(fresh.slice(0, 80));
  const words = fresh.map(([en, hint]) => ({ en, ru: tr[en] || hint.split(", ").slice(0, 2).join(", ") || "—", src: "duo", date: today }));

  // ошибки: только с ответом и правильным вариантом, которых ещё нет
  const known = new Set(MISTAKES.map((m) => looseText(m.prompt) + "|" + looseText(m.yours || "")));
  const ms = [];
  for (const x of data.mistakes || []) {
    const type = mistakeTypeOf(x.k);
    if (!type || !x.u || !x.c || !x.p) continue;
    if (looseText(x.u) === looseText(x.c)) continue;
    const id = "auto-" + x.id;
    if (MISTAKES.some((m) => m.id === id) || known.has(looseText(x.p) + "|" + looseText(x.u))) continue;
    ms.push({ id, date: dateOfTs(x.ts), type, prompt: x.p, yours: x.u, correct: x.c, why: [], rules: [], words: [] });
  }
  step(`Новых ошибок: ${ms.length}${ms.length && loadAiKey() ? " — разбираю «почему так»…" : ""}`);
  const ex = await aiExplainMistakes(ms.slice(0, 15));
  ms.forEach((m, i) => {
    const e = ex[i] || {};
    m.why = Array.isArray(e.why) && e.why.length ? e.why.map(String) : [`Сравни свой ответ с правильным: «${m.correct}».`];
    m.rules = (Array.isArray(e.rules) ? e.rules : []).filter((id) => RULES.some((r) => r.id === id));
    m.words = (Array.isArray(e.words) ? e.words : []).map(String);
  });

  // разделы: новые пройденные и их ключевые фразы
  const maxSeen = IMPORTED.meta.maxUnit != null ? IMPORTED.meta.maxUnit : IMPORT_BASELINE_UNIT;
  const passedNew = (data.units || []).filter((u) => u.i > maxSeen && u.n && u.p >= u.n);
  const linkUnits = [];
  const newUnits = [];
  for (const u of passedNew) {
    if (!u.ph || !u.ph.length) continue;
    const same = KEY_PHRASES.find((x) => x.phrases[0] && x.phrases[0][0] === u.ph[0][0]);
    if (same) { if (!linkUnits.includes(same.unit)) linkUnits.push(same.unit); continue; }
    const entry = { unit: u.i, cefr: u.c.replace(/\..*/, "") || "B1", title: u.t, phrases: u.ph.filter((p) => p[0]) };
    newUnits.push(entry);
    linkUnits.push(u.i);
  }
  if (passedNew.length) IMPORTED.meta.maxUnit = Math.max(maxSeen, ...passedNew.map((u) => u.i));

  // сохраняем
  IMPORTED.words.push(...words);
  IMPORTED.mistakes.push(...ms);
  IMPORTED.units.push(...newUnits);
  if (words.length || passedNew.length) {
    const id = "auto-duo-" + today;
    let entry = IMPORTED.log.find((e) => e.id === id);
    if (!entry) { entry = { id, date: today, source: "duo", units: [], lessons: [], newWords: [], rules: [] }; IMPORTED.log.push(entry); }
    for (const u of passedNew) if (!entry.lessons.some((l) => l.skill === u.t)) entry.lessons.push({ skill: u.t, lessonNum: "раздел пройден ✓" });
    if (!entry.lessons.length) entry.lessons.push({ skill: "Новые слова из Duolingo", lessonNum: "обновлено закладкой" });
    for (const w of words) if (!entry.newWords.includes(w.en)) entry.newWords.push(w.en);
    for (const u of linkUnits) if (!entry.units.includes(u)) entry.units.push(u);
  }
  IMPORTED.meta.lastDuo = Date.now();
  saveImported();
  // применяем к данным приложения сразу, без перезагрузки
  for (const w of words.slice().reverse()) WORDS_DATA.unshift({ en: w.en, ru: w.ru, src: "duo", id: WORDS_DATA.reduce((m, x) => Math.max(m, x.id), 0) + 1 });
  for (const m of ms) MISTAKES.unshift(m);
  for (const u of newUnits) KEY_PHRASES.push(u);
  const logEntry = IMPORTED.log.find((e) => e.id === "auto-duo-" + today);
  if (logEntry) { const i = DUO_LOG.findIndex((e) => e.id === logEntry.id); if (i >= 0) DUO_LOG.splice(i, 1); DUO_LOG.unshift(logEntry); }
  resetDataCaches();
  return { words: words.length, mistakes: ms.length, units: passedNew.length, phrases: newUnits.reduce((s, u) => s + u.phrases.length, 0), noKey: !loadAiKey() };
}

async function processPuzzleImport(data, step) {
  const today = todayStr();
  const have = new Set(WORDS_DATA.map((w) => importKey(w.en)));
  const words = [];
  for (const [en, ru, tr] of data.words || []) {
    const k = importKey(en);
    if (!k || have.has(k)) continue;
    have.add(k);
    const w = { en, ru: ru || "—", src: "puzzle", date: today };
    if (tr) w.tr = tr;
    words.push(w);
  }
  step(`Новых слов из Puzzle English: ${words.length}`);
  IMPORTED.words.push(...words);
  if (words.length) {
    const id = "auto-pe-" + today;
    let entry = IMPORTED.log.find((e) => e.id === id);
    if (!entry) { entry = { id, date: today, source: "puzzle", units: [], lessons: [{ skill: "Puzzle English", lessonNum: "«Мой словарь»" }], newWords: [], rules: [] }; IMPORTED.log.push(entry); }
    for (const w of words) if (!entry.newWords.includes(w.en)) entry.newWords.push(w.en);
    const i = DUO_LOG.findIndex((e) => e.id === id); if (i >= 0) DUO_LOG.splice(i, 1); DUO_LOG.unshift(entry);
  }
  IMPORTED.meta.lastPuzzle = Date.now();
  saveImported();
  for (const w of words.slice().reverse()) {
    const item = { en: w.en, ru: w.ru, src: "puzzle", id: WORDS_DATA.reduce((m, x) => Math.max(m, x.id), 0) + 1 };
    if (w.tr) item.tr = w.tr;
    WORDS_DATA.unshift(item);
  }
  resetDataCaches();
  return { words: words.length, mistakes: 0, units: 0, phrases: 0 };
}

async function runImport(b64) {
  const modal = document.getElementById("import-modal");
  const body = document.getElementById("import-body");
  const lines = [];
  const step = (t) => { lines.push(t); body.innerHTML = lines.map((l) => `<div class="import-line">${escapeHtml(l)}</div>`).join("") + `<div class="import-line muted">${ico("loader-2")} работаю…</div>`; };
  modal.style.display = "flex";
  try {
    step("Получила данные, распаковываю…");
    const data = await decodeImport(b64);
    const res = data.src === "puzzle" ? await processPuzzleImport(data, step) : await processDuoImport(data, step);
    const nothing = !res.words && !res.mistakes && !res.units;
    body.innerHTML = `
      <div class="import-done">${ico("check")} ${nothing ? "Нового пока нет — всё уже в приложении." : "Готово!"}</div>
      ${nothing ? "" : `<div class="grade-rows">
        <div class="grade-row"><span>Новые слова</span><b>${res.words}</b></div>
        ${data.src === "puzzle" ? "" : `<div class="grade-row"><span>Ошибки с разбором</span><b>${res.mistakes}</b></div>
        <div class="grade-row"><span>Пройденные разделы</span><b>${res.units}</b></div>
        <div class="grade-row"><span>Ключевые фразы</span><b>${res.phrases}</b></div>`}
      </div>
      <p class="block-note">Всё лежит в Архиве, а сегодняшний день изучения попал в расписание — первый повтор завтра.</p>`}
      ${res.noKey && (res.words || res.mistakes) ? `<p class="block-note">Ключа Gemini нет, поэтому переводы — от Duolingo, а ошибки без подробного разбора. Ключ можно добавить в разделе «Диалог».</p>` : ""}
      <button class="reveal-btn" onclick="closeImport()">Хорошо</button>`;
  } catch (e) {
    body.innerHTML = `<div class="import-line">Не получилось обработать данные: ${escapeHtml(e.message)}</div><button class="reveal-btn" onclick="closeImport()">Закрыть</button>`;
  }
}
function closeImport() {
  document.getElementById("import-modal").style.display = "none";
  showView("home");
}

/* ---------- блок в Архиве ---------- */
function copyBookmarklet(btn) {
  const href = bookmarkletHref();
  const done = () => { const old = btn.innerHTML; btn.innerHTML = `${ico("check")} Скопировано`; setTimeout(() => { btn.innerHTML = old; }, 1800); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(href).then(done).catch(() => prompt("Скопируй код закладки:", href));
  else prompt("Скопируй код закладки:", href);
}
function renderImportBox() {
  const el = document.getElementById("import-box");
  if (!el) return;
  const fmt = (ts) => ts ? new Date(ts).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "ещё не было";
  el.innerHTML = `
    <p class="block-note" style="margin-top:0;">Закладка сама заберёт новые слова, ошибки и ключевые фразы и добавит их сюда — без Claude. Нажимай её на duolingo.com или puzzle-english.com, когда пройдёшь новые уроки.</p>
    <div class="settings-row" style="margin-top:0;">
      <a class="bookmarklet" href="${bookmarkletHref().replace(/"/g, "&quot;")}" onclick="alert('Это закладка: перетащи кнопку на панель закладок браузера (или скопируй код — инструкция ниже). Нажимать её нужно на сайте Duolingo или Puzzle English.'); return false;">${ico("bookmark")} Мой английский</a>
      <button class="small-btn" onclick="copyBookmarklet(this)">${ico("copy")} Скопировать код закладки</button>
    </div>
    <details class="import-help">
      <summary>Как поставить закладку</summary>
      <p><b>На компьютере:</b> перетащи кнопку «Мой английский» на панель закладок Chrome (Ctrl+Shift+B — показать панель).</p>
      <p><b>На телефоне (Chrome):</b> 1) нажми «Скопировать код закладки»; 2) открой любую страницу, нажми ⋮ → ☆ (добавить в закладки), затем «Изменить»; 3) название — «Мой английский», в поле адреса удали всё и вставь скопированный код, сохрани.</p>
      <p><b>Как пользоваться:</b> открой duolingo.com (или puzzle-english.com), где ты вошла в аккаунт. На компьютере — нажми закладку; на телефоне — в адресной строке набери «Мой английский» и выбери закладку из подсказок. Через несколько секунд откроется приложение с новым материалом.</p>
    </details>
    <div class="sched" style="margin-top:12px;">
      <div class="sched-row"><span class="sched-label">Duolingo</span><span class="sched-next">${fmt(IMPORTED.meta.lastDuo)}</span></div>
      <div class="sched-row"><span class="sched-label">Puzzle English</span><span class="sched-next">${fmt(IMPORTED.meta.lastPuzzle)}</span></div>
      <div class="sched-row"><span class="sched-label">Добавлено закладкой</span><span class="sched-next">${IMPORTED.words.length} ${plural(IMPORTED.words.length, "слово", "слова", "слов")} · ${IMPORTED.mistakes.length} ${plural(IMPORTED.mistakes.length, "ошибка", "ошибки", "ошибок")}</span></div>
    </div>`;
}

/* ---------- запуск: если приложение открыто закладкой ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const m = location.hash.match(/^#import=([A-Za-z0-9_-]+)$/);
  if (!m) return;
  history.replaceState(null, "", location.pathname + location.search);
  setTimeout(() => runImport(m[1]), 0);
});
