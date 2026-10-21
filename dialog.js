/* ============ Диалог с собеседником ============
   Собеседник (ИИ Gemini) говорит по-английски только словами из твоего словаря.
   Ты видишь, ЧТО ответить, по-русски, и переводишь это на английский.
   Каждый ответ проверяется по смыслу: ошибки объясняются «почему так, а не иначе»
   со ссылкой на правило и сохраняются во вкладку «Уроки → Ошибки».
   Использует из app.js: WORDS_DATA, RULES, KEY_PHRASES, callGeminiRaw, loadAiKey,
   isKnownToken, cleanToken, escapeHtml, ico, speakButtonHtml, speakEn, openRule, plural. */

const LS_DIALOG = "enapp_dialog_current_v1";
const LS_DIALOG_MISTAKES = "enapp_dialog_mistakes_v1";
const DIALOG_TURNS = 8; // сколько раз отвечаешь ты за один диалог
let DIALOG = loadJSON(LS_DIALOG, null); // { topic, turns: [{partner_en, partner_ru, reply_ru, reply_en, answer, result}], current, done }
let DIALOG_MISTAKES = loadJSON(LS_DIALOG_MISTAKES, []);
let dialogBusy = false;
let dialogTopic = "random";

function saveDialog() { saveJSON(LS_DIALOG, DIALOG); }
function saveDialogMistakes() {
  saveJSON(LS_DIALOG_MISTAKES, DIALOG_MISTAKES);
  if (window.CloudSync) window.CloudSync.schedulePush();
}

/* ---------- словарь для подсказки ИИ ---------- */
let DIALOG_VOCAB = null;
function dialogVocab() {
  if (DIALOG_VOCAB) return DIALOG_VOCAB;
  const set = new Set();
  for (const w of WORDS_DATA) {
    const k = w.en.toLowerCase().replace(/^(to|a|an)\s+/, "").replace(/[.!?]/g, "").trim();
    if (k.split(/\s+/).length <= 3) set.add(k);
  }
  DIALOG_VOCAB = [...set].join(", ");
  return DIALOG_VOCAB;
}
function dialogRulesList() {
  return RULES.map((r) => `${r.id} — ${r.title.split(":")[0]}`).join("; ");
}
function dialogTopics() {
  const recent = (typeof KEY_PHRASES !== "undefined" ? [...KEY_PHRASES].sort((a, b) => b.unit - a.unit) : [])
    .map((u) => u.title.split(" / ")[0]).filter((t, i, a) => a.indexOf(t) === i).slice(0, 8);
  return [["random", "Любая тема"], ...recent.map((t) => [t, t])];
}
function topicPrompt(topic) {
  if (topic === "random") return "любая бытовая тема из жизни (покупки, работа, поездки, семья, здоровье, выходные — выбери сам)";
  return `тема раздела Duolingo: «${topic}»`;
}

/* ---------- запросы к ИИ ---------- */
function parseJsonLoose(raw) {
  const clean = String(raw).replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{"), end = clean.lastIndexOf("}");
  return JSON.parse(clean.slice(start, end + 1));
}
const DIALOG_TURN_SPEC = `{"partner_en": "реплика собеседника по-английски (1–2 коротких предложения, обычно с вопросом ко мне)",
 "partner_ru": "её перевод на русский",
 "reply_ru": "что Я отвечаю — одно естественное предложение по-русски, которое можно перевести только словами из списка",
 "reply_en": "образцовый перевод reply_ru на английский только словами из списка"}`;
function dialogBasePrompt() {
  return `Ты — дружелюбный собеседник-англичанин в учебном диалоге. Ученица говорит по-русски, уровень английского A2–B1.
ГЛАВНОЕ ОГРАНИЧЕНИЕ: в partner_en и reply_en используй ТОЛЬКО слова из списка её словаря (в любых грамматических формах: -s, -ed, -ing, неправильные формы глаголов), плюс местоимения, артикли, предлоги, союзы, числа и имена. Никаких других слов. Если хочется сказать сложнее — скажи проще.
Пиши живо и естественно, как настоящий человек, коротко. Грамматика — простая (Present/Past Simple, Present Continuous, will/going to, can/should, Present Perfect).
Словарь ученицы: ${dialogVocab()}`;
}
async function dialogStart(topic) {
  const prompt = `${dialogBasePrompt()}

Начни диалог. ${topicPrompt(topic)}.
Ответь СТРОГО JSON без markdown, ровно в формате:
${DIALOG_TURN_SPEC}`;
  return parseJsonLoose(await callGeminiRaw(prompt, true));
}
async function dialogCheck(turn, answer, history, last) {
  const hist = history.map((t) => `Собеседник: ${t.partner_en}\nУченица: ${t.answer || t.reply_en}`).join("\n");
  const prompt = `${dialogBasePrompt()}

Список правил приложения (id — название): ${dialogRulesList()}

История диалога:
${hist || "(начало)"}
Собеседник: ${turn.partner_en}
Ученица должна была ответить по-русски: «${turn.reply_ru}» (образец: «${turn.reply_en}»).
Ученица написала по-английски: «${answer}»

1) Проверь её ответ как мудрый и добрый учитель. Сравнивай по СМЫСЛУ и грамматике, а не дословно с образцом: другой верный вариант — тоже верно.
   verdict: "correct" — верно (можно с мелкими различиями вариантов), "minor" — смысл верный, но есть мелкая ошибка (опечатка, артикль, предлог, -s), "wrong" — грамматическая ошибка или смысл потерян.
   corrected — исправленный вариант, максимально близкий к ЕЁ ответу (если верно — её ответ с исправленной пунктуацией).
   mistakes — для каждой ошибки: what (что не так, коротко) и why (почему так, а не иначе — простое объяснение по-русски с примером, 1–2 предложения, по-доброму, без занудства). Если ошибок нет — пустой массив.
   rule_ids — id правил из списка, к которым относятся ошибки (0–2 шт.).
   praise — если верно: короткая живая похвала по-русски; иначе пустая строка.
2) ${last ? "Это последний ответ: next = null, а в partner_bye — короткое прощание собеседника по-английски из слов словаря и его перевод в partner_bye_ru." : "Продолжи диалог: next — следующая реплика собеседника (реагирует на её ответ) и что она отвечает дальше."}
Ответь СТРОГО JSON без markdown:
{"verdict": "correct|minor|wrong", "corrected": "...", "mistakes": [{"what": "...", "why": "..."}], "rule_ids": [], "praise": "...",
 "next": ${last ? "null" : DIALOG_TURN_SPEC}${last ? ', "partner_bye": "...", "partner_bye_ru": "..."' : ""}}`;
  return parseJsonLoose(await callGeminiRaw(prompt, true));
}

/* ---------- действия ---------- */
async function startDialog() {
  if (!loadAiKey()) { alert("Сначала вставь и сохрани ключ ИИ выше."); return; }
  if (dialogBusy) return;
  dialogBusy = true;
  renderDialog();
  try {
    const first = await dialogStart(dialogTopic);
    DIALOG = { topic: dialogTopic, startedAt: Date.now(), turns: [first], done: false };
    saveDialog();
  } catch (e) {
    alert("Не получилось начать диалог: " + e.message + "\n\nПроверь ключ ИИ и интернет.");
  } finally {
    dialogBusy = false;
    renderDialog();
  }
}
async function submitDialogAnswer(giveUp) {
  if (!DIALOG || DIALOG.done || dialogBusy) return;
  const input = document.getElementById("dialog-input");
  const answer = giveUp ? "" : (input ? input.value.trim() : "");
  if (!giveUp && !answer) { if (input) input.focus(); return; }
  const turn = DIALOG.turns[DIALOG.turns.length - 1];
  const last = DIALOG.turns.length >= DIALOG_TURNS;
  turn.answer = answer;
  dialogBusy = true;
  renderDialog();
  try {
    let res;
    if (giveUp) {
      res = { verdict: "wrong", corrected: turn.reply_en, mistakes: [{ what: "Ответ пропущен", why: "Посмотри образец, прочитай его вслух и попробуй повторить в следующий раз." }], rule_ids: [], praise: "" };
      const more = await dialogCheck(turn, turn.reply_en, DIALOG.turns.slice(0, -1), last);
      res.next = more.next; res.partner_bye = more.partner_bye; res.partner_bye_ru = more.partner_bye_ru;
    } else {
      res = await dialogCheck(turn, answer, DIALOG.turns.slice(0, -1), last);
    }
    turn.result = { verdict: res.verdict, corrected: res.corrected || turn.reply_en, mistakes: res.mistakes || [], rule_ids: (res.rule_ids || []).filter((id) => RULES.some((r) => r.id === id)), praise: res.praise || "" };
    if (turn.result.verdict !== "correct") saveDialogMistake(turn);
    if (last || !res.next) {
      DIALOG.done = true;
      DIALOG.bye = res.partner_bye ? { en: res.partner_bye, ru: res.partner_bye_ru || "" } : null;
    } else {
      DIALOG.turns.push(res.next);
    }
    saveDialog();
    if (turn.result.verdict === "correct") speakEn(turn.result.corrected);
  } catch (e) {
    turn.answer = undefined;
    alert("Не получилось проверить ответ: " + e.message);
  } finally {
    dialogBusy = false;
    renderDialog();
    const el = document.getElementById("dialog-input");
    if (el && !DIALOG.done) el.focus();
  }
}
function saveDialogMistake(turn) {
  const why = turn.result.mistakes.map((m) => (m.what ? `${m.what} — ${m.why}` : m.why)).filter(Boolean);
  DIALOG_MISTAKES.unshift({
    id: "d" + Date.now(),
    date: new Date().toISOString().slice(0, 10),
    type: "dialog",
    prompt: turn.reply_ru,
    context: turn.partner_en,
    yours: turn.answer || "",
    correct: turn.result.corrected,
    why: why.length ? why : ["Сравни свой вариант с правильным."],
    rules: turn.result.rule_ids,
    words: [],
  });
  DIALOG_MISTAKES = DIALOG_MISTAKES.slice(0, 100);
  saveDialogMistakes();
}
function newDialog() {
  DIALOG = null;
  saveDialog();
  renderDialog();
}
function setDialogTopic(t) {
  dialogTopic = t;
  renderDialog();
}
function showDialogHint() {
  const turn = DIALOG && DIALOG.turns[DIALOG.turns.length - 1];
  if (!turn) return;
  const words = turn.reply_en.split(/\s+/);
  const el = document.getElementById("dialog-hint");
  if (el) el.textContent = "Начало: " + words.slice(0, Math.max(2, Math.ceil(words.length / 3))).join(" ") + " …";
}
function toggleDialogRu(i) {
  const el = document.getElementById("dlg-ru-" + i);
  if (el) el.hidden = !el.hidden;
}

/* ---------- отрисовка ---------- */
function dialogPartnerText(text) {
  // незнакомые слова подчёркнуты; нажатие — перевод
  return String(text).split(/(\s+)/).map((chunk) => {
    if (/^\s+$/.test(chunk)) return chunk;
    const clean = cleanToken(chunk);
    if (!clean) return escapeHtml(chunk);
    const unknown = !/^[A-Z]/.test(chunk) && !isKnownToken(clean);
    return `<span class="tap-word ${unknown ? "unknown" : ""}" onclick="showDialogWord('${encodeURIComponent(clean)}')">${escapeHtml(chunk)}</span>`;
  }).join("");
}
async function showDialogWord(enc) {
  const popup = document.getElementById("word-translate-popup");
  await showWordTranslation(enc);
  if (popup) popup.scrollIntoView({ block: "nearest" });
}
function dialogResultHtml(turn) {
  const r = turn.result;
  if (!r) return "";
  const cls = r.verdict === "correct" ? "good" : r.verdict === "minor" ? "minor" : "bad";
  const head = r.verdict === "correct" ? `${ico("check")} ${escapeHtml(r.praise || "Верно!")}`
    : r.verdict === "minor" ? `${ico("bulb")} Почти! Смысл верный, есть мелочь` : `${ico("x")} Есть ошибка`;
  const rules = r.rule_ids.map((id) => {
    const rule = RULES.find((x) => x.id === id);
    return rule ? `<span class="rule-chip" onclick="openRule('${id}')">${escapeHtml(rule.title.split(":")[0])}</span>` : "";
  }).join("");
  return `<div class="dlg-feedback ${cls}">
    <div class="dlg-feedback-head">${head}</div>
    ${r.verdict !== "correct" ? `<div class="dlg-correct">${speakButtonHtml(r.corrected)}<span>${escapeHtml(r.corrected)}</span></div>` : ""}
    ${r.mistakes.length ? `<ul>${r.mistakes.map((m) => `<li>${m.what ? `<b>${escapeHtml(m.what)}.</b> ` : ""}${escapeHtml(m.why)}</li>`).join("")}</ul>` : ""}
    ${rules ? `<div class="dlg-rules">${rules}</div>` : ""}
  </div>`;
}
function renderDialog() {
  const key = loadAiKey();
  const keyCard = document.getElementById("ai-key-card");
  if (keyCard) keyCard.style.display = key ? "none" : "block";
  const setup = document.getElementById("dialog-setup");
  const chat = document.getElementById("dialog-chat");
  if (!setup || !chat) return;
  const popup = document.getElementById("word-translate-popup");
  if (popup) popup.style.display = "none";

  if (!DIALOG) {
    setup.style.display = "";
    chat.style.display = "none";
    document.getElementById("dialog-topics").innerHTML = dialogTopics().map(([k, label]) =>
      `<button type="button" class="filter-chip ${dialogTopic === k ? "active" : ""}" onclick="setDialogTopic(${JSON.stringify(k).replace(/"/g, "&quot;")})">${escapeHtml(label)}</button>`).join("");
    const btn = document.getElementById("dialog-start-btn");
    btn.disabled = dialogBusy;
    btn.innerHTML = dialogBusy ? `${ico("loader-2")} Собеседник думает…` : `${ico("messages")} Начать диалог`;
    return;
  }

  setup.style.display = "none";
  chat.style.display = "";
  const turns = DIALOG.turns;
  const answered = turns.filter((t) => t.result);
  const good = answered.filter((t) => t.result.verdict === "correct").length;
  let html = `<div class="dlg-progress">${answered.length} из ${DIALOG_TURNS} · верно ${good}</div>`;
  turns.forEach((t, i) => {
    html += `<div class="dlg-msg partner">
      <div class="dlg-bubble">
        <div class="dlg-en">${dialogPartnerText(t.partner_en)}</div>
        <div class="dlg-ru" id="dlg-ru-${i}" hidden>${escapeHtml(t.partner_ru)}</div>
        <div class="dlg-tools">${speakButtonHtml(t.partner_en)}<button type="button" class="small-btn" onclick="toggleDialogRu(${i})">${ico("language")} Перевод</button></div>
      </div>
    </div>`;
    if (t.result) {
      html += `<div class="dlg-msg me">
        <div class="dlg-bubble">
          <div class="dlg-task-ru">${escapeHtml(t.reply_ru)}</div>
          <div class="dlg-en">${t.answer ? escapeHtml(t.answer) : "<i>пропущено</i>"}</div>
        </div>
      </div>${dialogResultHtml(t)}`;
    }
  });
  const cur = turns[turns.length - 1];
  if (DIALOG.done) {
    if (DIALOG.bye) html += `<div class="dlg-msg partner"><div class="dlg-bubble"><div class="dlg-en">${dialogPartnerText(DIALOG.bye.en)}</div><div class="dlg-ru">${escapeHtml(DIALOG.bye.ru)}</div></div></div>`;
    const mistakes = answered.filter((t) => t.result.verdict !== "correct").length;
    html += `<div class="card dlg-summary">
      <h2 class="block-title">Диалог окончен</h2>
      <p class="block-note">Верно ${good} из ${answered.length}.${mistakes ? ` Ошибки (${mistakes}) сохранены в «Уроки → Ошибки» — их можно повторить позже.` : " Без единой ошибки!"}</p>
      <div class="settings-row">
        <button class="small-btn learn-btn" onclick="newDialog()">${ico("refresh")} Новый диалог</button>
        ${mistakes ? `<button class="small-btn" onclick="showView('duo'); setDuoTab('mistakes')">${ico("circle-x")} Мои ошибки</button>` : ""}
      </div>
    </div>`;
  } else if (!cur.result) {
    html += `<div class="card dlg-task">
      <div class="dlg-task-label">Ответь по-английски:</div>
      <div class="dlg-task-ru big">${escapeHtml(cur.reply_ru)}</div>
      <div class="type-answer-row">
        <input type="text" id="dialog-input" class="type-answer-input" placeholder="Твой ответ по-английски…" autocomplete="off" autocapitalize="off" spellcheck="false" ${dialogBusy ? "disabled" : ""}>
        ${micAnswerButtonHtml("en-US", "dialog-input")}
      </div>
      <div class="dlg-hint" id="dialog-hint"></div>
      <div class="settings-row">
        <button class="small-btn learn-btn" onclick="submitDialogAnswer()" ${dialogBusy ? "disabled" : ""}>${dialogBusy ? `${ico("loader-2")} Проверяю…` : `${ico("check")} Ответить`}</button>
        <button class="small-btn" onclick="showDialogHint()" ${dialogBusy ? "disabled" : ""}>${ico("bulb")} Подсказка</button>
        <button class="small-btn" onclick="submitDialogAnswer(true)" ${dialogBusy ? "disabled" : ""}>Не знаю</button>
      </div>
    </div>`;
  }
  html += `<div class="settings-row" style="margin-top:12px;"><button class="small-btn" onclick="if (confirm('Закончить этот диалог и начать новый?')) newDialog()">${ico("x")} Закончить</button></div>`;
  chat.innerHTML = html;
  const input = document.getElementById("dialog-input");
  if (input) {
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); submitDialogAnswer(); } });
  }
}
