/* ============ Повторение по дням изучения ============
   Всё, что ты изучила в один день (новые слова раздела Duolingo, ошибки этого дня,
   ключевые фразы раздела, связанные фразовые глаголы и правила), — это «день изучения».
   Каждый день изучения повторяется через 1, 3, 7, 14, 30, 60, 120, 240 дней.
   Старый словарь (≈2700 слов без даты) подмешивается порциями по 15 слов в день —
   каждая порция становится отдельным днём изучения.

   Одно повторение = 3 шага: слова → тренажёры (фразовые глаголы, ключевые фразы) → правила.
   За повторение ставится оценка 5/4/3/2 по доле верных ответов С ПЕРВОЙ ПОПЫТКИ;
   она уходит в «Дневник». С оценкой 2 материал не идёт дальше по расписанию — завтра ещё раз.

   Использует из app.js: WORDS_DATA, RULES, PHRASALS, KEY_PHRASES, DUO_LOG, allMistakes,
   normKey, ruleKey, rulesForWord, ruleLearnedInfo, getProgress, registerReview, matchAnswer,
   kpCompare, pickCardDirection, shuffleArray, escapeHtml, ico, plural, speakButtonHtml, speakEn,
   micAnswerButtonHtml, phrasalGap, renderCard, SESSION, todayStr, loadJSON, saveJSON. */

const REVIEW_OFFSETS = [1, 3, 7, 14, 30, 60, 120, 240];
const REVIEW_SINCE = "2026-10-01"; // старее — без дат и без подробностей, это архив
const BACKLOG_PORTION = 15;
const MAX_GROUPS_PER_SESSION = 5;
const MAX_WORDS_PER_SESSION = 45;
const MAX_TRAINER_ITEMS = 8;
const MAX_RULES_PER_SESSION = 3;

const LS_REVIEW = "enapp_review_v1";
const LS_DIARY = "enapp_diary_v1";
const LS_BACKLOG = "enapp_backlog_v1";
let REVIEW_STATE = loadJSON(LS_REVIEW, {}); // { groupId: { step, next, last } }
let DIARY = loadJSON(LS_DIARY, []);          // [{ date, at, grade, pct, steps, groups }]
let BACKLOG = loadJSON(LS_BACKLOG, { portions: [] }); // portions: [{ date, words: [en] }]

function saveReviewData() {
  saveJSON(LS_REVIEW, REVIEW_STATE);
  saveJSON(LS_DIARY, DIARY);
  saveJSON(LS_BACKLOG, BACKLOG);
  if (window.CloudSync) window.CloudSync.schedulePush();
}

/* ---------- даты ---------- */
function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}
function fmtDay(dateStr, withWeekday) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ru-RU", withWeekday ? { weekday: "long", day: "numeric", month: "long" } : { day: "numeric", month: "long" });
}
function relDay(dateStr) {
  const t = todayStr();
  if (dateStr <= t) return "сегодня";
  if (dateStr === addDays(t, 1)) return "завтра";
  if (dateStr === addDays(t, 2)) return "послезавтра";
  return fmtDay(dateStr);
}
function repLabel(step) {
  const off = REVIEW_OFFSETS[Math.min(step, REVIEW_OFFSETS.length - 1)];
  const when = off === 1 ? "через день" : off === 3 ? "через 3 дня" : off === 7 ? "через неделю" : off === 14 ? "через 2 недели"
    : off === 30 ? "через месяц" : off === 60 ? "через 2 месяца" : off === 120 ? "через 4 месяца" : "через 8 месяцев";
  return `${step + 1}-й повтор · ${when}`;
}

/* ---------- дни изучения ---------- */
function findWordAny(s) {
  return WORDS_DATA.find((w) => normKey(w.en) === normKey(s)) || WORDS_DATA.find((w) => ruleKey(w.en) === ruleKey(s)) || null;
}
function studyGroups() {
  const byDate = new Map();
  const get = (date) => {
    if (!byDate.has(date)) byDate.set(date, { id: "d:" + date, date, kind: "study", titles: [], words: new Map(), units: new Set(), mistakes: [] });
    return byDate.get(date);
  };
  for (const e of (typeof DUO_LOG !== "undefined" ? DUO_LOG : [])) {
    if (!e.date || e.date < REVIEW_SINCE) continue;
    const g = get(e.date);
    for (const l of e.lessons || []) {
      const t = String(l.skill || "").replace(/^Раздел \d+ · /, "");
      if (t && !g.titles.includes(t)) g.titles.push(t);
    }
    for (const s of e.newWords || []) { const w = findWordAny(s); if (w) g.words.set(w.en, w); }
    for (const u of e.units || []) g.units.add(u);
  }
  for (const m of allMistakes()) {
    if (!m.date || m.date < REVIEW_SINCE) continue;
    const g = get(m.date);
    g.mistakes.push(m);
    for (const s of m.words || []) { const w = findWordAny(s); if (w) g.words.set(w.en, w); }
    const t = m.type === "dialog" ? "Ошибки из диалога" : "Ошибки из Duolingo";
    if (!g.titles.includes(t) && !g.titles.some((x) => !x.startsWith("Ошибки"))) g.titles.push(t);
  }
  const groups = [...byDate.values()].map((g) => ({
    ...g, words: [...g.words.values()], units: [...g.units],
    label: g.titles.filter((x) => !x.startsWith("Ошибки")).slice(0, 2).join(" · ") || g.titles[0] || "Материал дня",
  }));
  BACKLOG.portions.forEach((p, i) => groups.push({
    id: "b:" + p.date, date: p.date, kind: "backlog", titles: [], units: [], mistakes: [],
    words: p.words.map(findWordAny).filter(Boolean), label: `Словарь · порция ${i + 1}`,
  }));
  return groups.filter((g) => g.words.length || g.mistakes.length || g.units.length).sort((a, b) => a.date.localeCompare(b.date));
}
function groupState(g) {
  return REVIEW_STATE[g.id] || { step: 0, next: g.kind === "backlog" ? g.date : addDays(g.date, REVIEW_OFFSETS[0]), last: null };
}
function dueGroups() {
  const t = todayStr();
  return studyGroups()
    .filter((g) => groupState(g).next <= t)
    .sort((a, b) => (a.kind === b.kind ? groupState(a).next.localeCompare(groupState(b).next) || a.date.localeCompare(b.date) : a.kind === "study" ? -1 : 1));
}
// следующая порция старого словаря: по порядку словаря, без слов из дней изучения и уже закреплённых
function nextBacklogWords() {
  const used = new Set();
  for (const g of studyGroups()) for (const w of g.words) used.add(w.en);
  for (const p of BACKLOG.portions) for (const s of p.words) used.add(s);
  return WORDS_DATA.filter((w) => !used.has(w.en) && getProgress(w.en).box < 4).slice(0, BACKLOG_PORTION).map((w) => w.en);
}
// новая порция — не чаще раза в день и только когда предыдущая уже начата (иначе порции копятся)
function hasTodayBacklog() {
  return BACKLOG.portions.some((p) => p.date === todayStr() || !REVIEW_STATE["b:" + p.date]);
}
function ensureTodayBacklog() {
  if (hasTodayBacklog()) return;
  const words = nextBacklogWords();
  if (words.length) BACKLOG.portions.push({ date: todayStr(), words });
}

/* ---------- состав повторения ---------- */
function planForGroups(groups) {
  const wordMap = new Map();
  for (const g of groups) for (const w of g.words) wordMap.set(w.en, w);
  const words = shuffleArray([...wordMap.values()]).slice(0, MAX_WORDS_PER_SESSION);
  const wordKeys = new Set([...wordMap.values()].map((w) => normKey(w.en)));

  // тренажёры: фразовые глаголы из слов этих дней + ключевые фразы разделов
  const trainers = [];
  for (const ph of (typeof PHRASALS !== "undefined" ? PHRASALS : [])) {
    if (!wordKeys.has(normKey(ph.en))) continue;
    trainers.push({ ph, kind: Math.random() < 0.5 ? "gap" : "particle", ex: ph.ex[Math.floor(Math.random() * ph.ex.length)] });
  }
  const units = new Set(groups.flatMap((g) => g.units));
  const kps = [];
  for (const u of (typeof KEY_PHRASES !== "undefined" ? KEY_PHRASES : [])) {
    if (!units.has(u.unit)) continue;
    for (const [en, ru] of u.phrases) kps.push({ kp: { en, ru, unit: u } });
  }
  const trainerItems = shuffleArray([...shuffleArray(trainers).slice(0, 5), ...shuffleArray(kps)]).slice(0, MAX_TRAINER_ITEMS);

  // правила: из ошибок этих дней и из правил слов; выученные (зачёркнутые) — пропускаем
  const mistakes = groups.flatMap((g) => g.mistakes).filter((m) => m.correct && /[a-z]/i.test(m.correct) && m.type !== "to-ru");
  const score = new Map();
  for (const m of mistakes) for (const id of m.rules || []) score.set(id, (score.get(id) || 0) + 3);
  for (const w of wordMap.values()) for (const r of rulesForWord(w)) score.set(r.id, (score.get(r.id) || 0) + 1);
  const ruleIds = [...score.entries()].filter(([id]) => RULES.some((r) => r.id === id) && !ruleLearnedInfo(id))
    .sort((a, b) => b[1] - a[1]).slice(0, MAX_RULES_PER_SESSION).map(([id]) => id);
  const ruleItems = [];
  for (const id of ruleIds) {
    const tasks = [];
    for (const m of mistakes) if ((m.rules || []).includes(id) && tasks.length < 2) tasks.push({ ruleTask: { rule: id, kind: "mistake", m } });
    const ruleWords = buildRuleIndex().byRule[id].words;
    const pool = shuffleArray(ruleWords.filter((w) => wordMap.has(w.en))).concat(shuffleArray(ruleWords));
    for (const w of pool) {
      if (tasks.length >= 2) break;
      if (tasks.some((t) => t.ruleTask.word === w)) continue;
      tasks.push({ ruleTask: { rule: id, kind: "word", word: w } });
    }
    ruleItems.push(...tasks);
  }
  return {
    words: words.map((w) => ({ word: w, dir: pickCardDirection() })),
    trainers: trainerItems,
    rules: ruleItems,
  };
}
// в одно повторение — дни подряд (сначала самые давние), пока набирается ~45 слов, но не больше 5 дней
function sessionSlice(due) {
  const out = [];
  let words = 0;
  for (const g of due) {
    if (out.length >= MAX_GROUPS_PER_SESSION) break;
    if (out.length && words + g.words.length > MAX_WORDS_PER_SESSION) break;
    out.push(g);
    words += g.words.length;
  }
  return out;
}
function todaysSessionGroups() {
  return sessionSlice(dueGroups());
}

/* ---------- сессия ---------- */
const REVIEW_STEP_TITLES = { words: "Слова", trainers: "Тренажёры", rules: "Правила" };
function startReview() {
  ensureTodayBacklog();
  saveReviewData();
  let groups = todaysSessionGroups();
  if (!groups.length) { alert("На сегодня всё повторено!"); renderReviewHome(); return; }
  const plan = planForGroups(groups);
  const steps = ["words", "trainers", "rules"].filter((k) => plan[k].length).map((k) => ({ key: k, items: plan[k] }));
  if (!steps.length) { alert("В этих днях изучения нечего повторять."); return; }
  SESSION = {
    mode: "review", groups, steps, stepIdx: 0, queue: steps[0].items, idx: 0, correctCount: 0,
    revealed: false, showAssoc: false, typedChecked: false, typedValue: "", typedCorrect: null,
    stats: { words: { c: 0, t: 0 }, trainers: { c: 0, t: 0 }, rules: { c: 0, t: 0 } }, seen: {},
  };
  document.getElementById("session-overlay").style.display = "flex";
  renderCard();
}
// учёт ответа с первой попытки (повтор после ошибки баллов не добавляет)
function reviewTrack(key, correct) {
  if (!SESSION || SESSION.mode !== "review") return;
  if (SESSION.seen[key]) return;
  SESSION.seen[key] = true;
  const st = SESSION.stats[SESSION.steps[SESSION.stepIdx].key];
  st.t++;
  if (correct) st.c++;
}
function reviewStepLabel() {
  if (!SESSION || SESSION.mode !== "review") return "";
  return `${REVIEW_STEP_TITLES[SESSION.steps[SESSION.stepIdx].key]} · `;
}
function gradeFor(pct) { return pct >= 90 ? 5 : pct >= 75 ? 4 : pct >= 60 ? 3 : 2; }
function gradeWord(g) { return g === 5 ? "отлично" : g === 4 ? "хорошо" : g === 3 ? "удовлетворительно" : "нужно повторить"; }
function renderReviewStepEnd() {
  const step = SESSION.steps[SESSION.stepIdx];
  const st = SESSION.stats[step.key];
  const next = SESSION.steps[SESSION.stepIdx + 1];
  if (next) {
    document.getElementById("flash-area").innerHTML = `
      <div class="session-done review-step-done">
        <div class="step-dots">${SESSION.steps.map((s, i) => `<span class="${i <= SESSION.stepIdx ? "on" : ""}">${REVIEW_STEP_TITLES[s.key]}</span>`).join("")}</div>
        <h2>${REVIEW_STEP_TITLES[step.key]} — готово</h2>
        <p>Верно с первой попытки: <b>${st.c}</b> из <b>${st.t}</b></p>
        <p class="next-step">Дальше: <b>${REVIEW_STEP_TITLES[next.key]}</b> · ${next.items.length} ${plural(next.items.length, "задание", "задания", "заданий")}</p>
        <button class="reveal-btn" onclick="nextReviewStep()">Дальше ${ico("arrow-right")}</button>
      </div>`;
    return;
  }
  finishReview();
}
function nextReviewStep() {
  SESSION.stepIdx++;
  SESSION.queue = SESSION.steps[SESSION.stepIdx].items;
  SESSION.idx = 0;
  SESSION.revealed = false; SESSION.showAssoc = false; SESSION.typedChecked = false;
  SESSION.typedValue = ""; SESSION.typedCorrect = null; SESSION.chosen = null; SESSION.options = null;
  renderCard();
}
function finishReview() {
  if (!SESSION.finished) {
    const s = SESSION.stats;
    const c = s.words.c + s.trainers.c + s.rules.c, t = s.words.t + s.trainers.t + s.rules.t;
    const pct = t ? Math.round((c / t) * 100) : 0;
    const grade = gradeFor(pct);
    const today = todayStr();
    const groupsInfo = SESSION.groups.map((g) => {
      const st = groupState(g);
      const rep = st.step;
      let next;
      if (g.kind === "backlog" && !REVIEW_STATE[g.id]) {
        // порция старых слов: первое прохождение — это и есть «день изучения», дальше по плану с 1-го повтора
        next = addDays(today, 1);
        REVIEW_STATE[g.id] = { step: 0, next, last: today };
        return { id: g.id, label: g.label, date: g.date, rep: 0, next };
      }
      if (grade >= 3) {
        const step = st.step + 1;
        const off = REVIEW_OFFSETS[Math.min(step, REVIEW_OFFSETS.length - 1)] + (step >= REVIEW_OFFSETS.length ? (step - REVIEW_OFFSETS.length + 1) * 240 : 0);
        // по плану — от дня изучения; если материал повторяли с опозданием,
        // следующий повтор не раньше, чем через тот же промежуток, что между ступенями плана
        const prevOff = REVIEW_OFFSETS[Math.min(step - 1, REVIEW_OFFSETS.length - 1)] || 0;
        const gap = Math.max(1, off - prevOff);
        next = addDays(g.date, off);
        if (next < addDays(today, gap)) next = addDays(today, gap);
        REVIEW_STATE[g.id] = { step, next, last: today };
      } else {
        next = addDays(today, 1);
        REVIEW_STATE[g.id] = { step: st.step, next, last: today };
      }
      return { id: g.id, label: g.kind === "backlog" ? g.label : `${fmtDay(g.date)} · ${g.label}`, date: g.date, rep: rep + 1, next };
    });
    DIARY.unshift({ date: today, at: Date.now(), grade, pct, steps: JSON.parse(JSON.stringify(s)), groups: groupsInfo });
    DIARY = DIARY.slice(0, 400);
    saveReviewData();
    SESSION.finished = { grade, pct, groupsInfo };
  }
  const f = SESSION.finished;
  const s = SESSION.stats;
  const line = (k) => s[k].t ? `<div class="grade-row"><span>${REVIEW_STEP_TITLES[k]}</span><b>${s[k].c} / ${s[k].t}</b></div>` : "";
  document.getElementById("flash-area").innerHTML = `
    <div class="session-done review-done">
      <div class="grade-big g${f.grade}">${f.grade}</div>
      <h2>${gradeWord(f.grade)[0].toUpperCase() + gradeWord(f.grade).slice(1)}</h2>
      <p>${f.pct}% верных с первой попытки</p>
      <div class="grade-rows">${line("words")}${line("trainers")}${line("rules")}</div>
      <p class="next-step">${f.grade >= 3
        ? `Следующий повтор этого материала: ${[...new Set(f.groupsInfo.map((g) => relDay(g.next)))].join(", ")}.`
        : "Материал вернётся завтра — повторим ещё раз."}</p>
      <p class="block-note">Оценка записана в дневник.</p>
      <button class="reveal-btn" onclick="closeSession()">Готово</button>
      <button class="reveal-btn ghost" onclick="closeSession(); showView('diary')">${ico("book")} Дневник</button>
    </div>`;
}

/* ---------- шаг «Правила»: задание по правилу ---------- */
function renderRuleTaskCard() {
  const item = currentItem();
  const t = item.ruleTask;
  const rule = RULES.find((r) => r.id === t.rule);
  const revealed = SESSION.revealed;
  let task = "", answer = "";
  if (t.kind === "mistake") {
    const m = t.m;
    if (m.type === "to-en" || m.type === "dialog") { task = `<div class="dlg-task-label">Твоя ошибка из ${m.type === "dialog" ? "диалога" : "Duolingo"}. Напиши по-английски:</div><div class="ph-sentence">${escapeHtml(m.prompt)}</div>`; }
    else { task = `<div class="dlg-task-label">Твоя ошибка из Duolingo. Напиши фразу правильно целиком:</div><div class="ph-sentence">${escapeHtml(m.prompt)}</div>`; }
    answer = m.correct;
  } else {
    task = `<div class="dlg-task-label">Переведи на английский:</div><div class="ph-sentence">${escapeHtml(t.word.ru)}</div>`;
    answer = t.word.en;
  }
  let feedback = "";
  if (revealed) {
    feedback = SESSION.typedCorrect
      ? `<div class="typed-feedback good">${ico("check")} Верно</div>`
      : `<div class="typed-feedback bad">${ico("x")} ${SESSION.typedValue ? `Твой ответ: «${escapeHtml(SESSION.typedValue)}»` : "Пропущено"}</div>`;
    feedback += `<div class="ph-explain">
      <div class="dlg-correct">${speakButtonHtml(answer)}<span>${escapeHtml(answer)}</span></div>
      <div class="rule-hint-title" style="margin-top:8px;">${escapeHtml(rule.title)}</div>
      <div>${escapeHtml(rule.hook)}</div>
      ${t.kind === "mistake" && !SESSION.typedCorrect ? `<ul>${(t.m.why || []).slice(0, 3).map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>` : ""}
    </div>`;
  }
  document.getElementById("flash-area").innerHTML = `
    <div class="flash-wrap">
      <div class="flashcard">
        <div class="dir-badge learn-badge">Правило</div>
        <div class="rule-task-title">${escapeHtml(rule.title.split(":")[0])}</div>
        ${task}
        ${feedback}
      </div>
      ${!revealed ? `
        <div class="type-answer-row">
          <input type="text" id="type-answer-input" class="type-answer-input" placeholder="По-английски…" autocomplete="off" autocapitalize="off" spellcheck="false">
          ${micAnswerButtonHtml("en-US")}
          <button class="check-btn" onclick="checkTyped()">Проверить</button>
        </div>` : `<button class="reveal-btn" onclick="nextCard()">Далее</button>`}
    </div>`;
  if (!revealed) { const input = document.getElementById("type-answer-input"); if (input) input.focus({ preventScroll: true }); }
}
function checkRuleTask() {
  const input = document.getElementById("type-answer-input");
  const value = input ? input.value.trim() : "";
  const item = currentItem();
  const t = item.ruleTask;
  let ok;
  if (t.kind === "mistake") ok = !!value && kpCompare(value, t.m.correct).ok;
  else { ok = matchAnswer(value, t.word.en, true); registerReview(t.word.en, ok); }
  SESSION.typedValue = value; SESSION.typedChecked = true; SESSION.typedCorrect = ok; SESSION.revealed = true;
  reviewTrack("r:" + t.rule + ":" + (t.kind === "mistake" ? t.m.id : t.word.en), ok);
  if (ok) SESSION.correctCount++;
  else if (SESSION.queue.filter((x) => x === item).length < 2) SESSION.queue.splice(Math.min(SESSION.queue.length, SESSION.idx + 3), 0, item);
  renderCard();
  speakEn(t.kind === "mistake" ? t.m.correct : t.word.en);
}

/* ---------- главная: только повторение ---------- */
function renderReviewHome() {
  const el = document.getElementById("review-home");
  if (!el) return;
  const dateEl = document.getElementById("today-date");
  if (dateEl) dateEl.textContent = fmtDay(todayStr(), true);
  const today = todayStr();
  const due = dueGroups();
  const sessionGroups = sessionSlice(due);
  const willAddBacklog = !hasTodayBacklog() && nextBacklogWords().length;
  const doneToday = DIARY.filter((d) => d.date === today);
  let html = "";
  if (sessionGroups.length || willAddBacklog) {
    const preview = planForGroups(sessionGroups);
    const nWords = preview.words.length + (willAddBacklog && sessionGroups.length < MAX_GROUPS_PER_SESSION ? BACKLOG_PORTION : 0);
    const parts = [
      nWords ? `${nWords} ${plural(nWords, "слово", "слова", "слов")}` : "",
      preview.trainers.length ? `${preview.trainers.length} в тренажёрах` : "",
      preview.rules.length ? `${new Set(preview.rules.map((r) => r.ruleTask.rule)).size} ${plural(new Set(preview.rules.map((r) => r.ruleTask.rule)).size, "правило", "правила", "правил")}` : "",
    ].filter(Boolean).join(" · ");
    html += `<button class="cta review-cta" onclick="startReview()"><span>Начать повторение<small>${escapeHtml(parts)}</small></span>${ico("arrow-right")}</button>`;
    html += `<h2 class="section-title">Сегодня повторяем</h2><div class="review-list">`;
    for (const g of sessionGroups) {
      const st = groupState(g);
      html += `<div class="review-item">
        <div class="review-date">${g.kind === "backlog" ? "Словарь" : fmtDay(g.date)}</div>
        <div class="review-label">${escapeHtml(g.label)}</div>
        <div class="review-sub">${g.kind === "backlog" && !REVIEW_STATE[g.id] ? "знакомство" : repLabel(st.step)}${g.words.length ? ` · ${g.words.length} ${plural(g.words.length, "слово", "слова", "слов")}` : ""}${g.mistakes.length ? ` · ${g.mistakes.length} ${plural(g.mistakes.length, "ошибка", "ошибки", "ошибок")}` : ""}</div>
      </div>`;
    }
    if (willAddBacklog && sessionGroups.length < MAX_GROUPS_PER_SESSION) {
      html += `<div class="review-item"><div class="review-date">Словарь</div><div class="review-label">Порция старых слов</div><div class="review-sub">знакомство · ${BACKLOG_PORTION} слов</div></div>`;
    }
    html += `</div>`;
    if (due.length > sessionGroups.length) html += `<p class="block-note">Ещё ${due.length - sessionGroups.length} ${plural(due.length - sessionGroups.length, "день", "дня", "дней")} изучения ждут — они войдут в следующее повторение.</p>`;
  } else {
    const upcoming = studyGroups().map((g) => ({ g, next: groupState(g).next })).filter((x) => x.next > today).sort((a, b) => a.next.localeCompare(b.next));
    html += `<div class="review-empty">
      <div class="grade-big g5">${ico("check")}</div>
      <h2>На сегодня всё повторено</h2>
      ${upcoming.length ? `<p>Следующее повторение — ${relDay(upcoming[0].next)}: ${escapeHtml(upcoming[0].g.label)}.</p>` : ""}
    </div>`;
  }
  if (doneToday.length) {
    html += `<div class="review-today">${doneToday.map((d) => `<span class="grade-chip g${d.grade}">${d.grade}</span>`).join("")}<span>${plural(doneToday.length, "повторение", "повторения", "повторений")} сегодня · <a href="#" onclick="showView('diary'); return false;">дневник</a></span></div>`;
  }
  el.innerHTML = html;
}

/* ---------- дневник ---------- */
function renderDiary() {
  const el = document.getElementById("diary-list");
  if (!el) return;
  if (!DIARY.length) {
    el.innerHTML = `<div class="empty-state">Здесь будут оценки за каждое повторение. Начни повторение на главной.</div>`;
    return;
  }
  const today = todayStr();
  const avg = (list) => list.length ? (list.reduce((s, d) => s + d.grade, 0) / list.length).toFixed(1).replace(".", ",") : "—";
  const week = DIARY.filter((d) => d.date > addDays(today, -7));
  const month = DIARY.filter((d) => d.date > addDays(today, -30));
  let html = `<div class="ledger diary-ledger">
    <div class="ledger-cell"><div class="num">${avg(week)}</div><div class="label">средний за неделю</div></div>
    <div class="ledger-cell"><div class="num">${avg(month)}</div><div class="label">за месяц</div></div>
    <div class="ledger-cell"><div class="num">${DIARY.length}</div><div class="label">${plural(DIARY.length, "повторение", "повторения", "повторений")}</div></div>
  </div>`;
  const byDate = new Map();
  for (const d of DIARY) { if (!byDate.has(d.date)) byDate.set(d.date, []); byDate.get(d.date).push(d); }
  for (const [date, list] of byDate) {
    html += `<h2 class="section-title diary-date">${fmtDay(date, true)}</h2>`;
    for (const d of list) {
      const s = d.steps || {};
      const part = (k) => s[k] && s[k].t ? `${REVIEW_STEP_TITLES[k]} ${s[k].c}/${s[k].t}` : "";
      html += `<div class="diary-entry">
        <div class="grade-chip big g${d.grade}">${d.grade}</div>
        <div class="diary-body">
          <div class="diary-groups">${(d.groups || []).map((g) => `${escapeHtml(g.label)} <span class="muted">(${g.rep ? g.rep + "-й повтор" : "знакомство"})</span>`).join("<br>")}</div>
          <div class="diary-steps">${[part("words"), part("trainers"), part("rules")].filter(Boolean).join(" · ")} · ${d.pct}%</div>
        </div>
      </div>`;
    }
  }
  el.innerHTML = html;
}

/* ---------- архив ---------- */
function renderArchive() {
  const setText = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
  setText("arc-words", `${WORDS_DATA.length}`);
  const visibleRules = RULES.filter((r) => buildRuleIndex().byRule[r.id].words.length);
  const learned = visibleRules.filter((r) => ruleLearnedInfo(r.id)).length;
  setText("arc-rules", `${RULES.length}${learned ? ` · выучено ${learned}` : ""}`);
  setText("arc-mistakes", `${allMistakes().length}`);
  setText("arc-lessons", `${(typeof DUO_LOG !== "undefined" ? DUO_LOG : []).length}`);
  setText("arc-phrases", `${typeof KEY_PHRASES !== "undefined" ? KEY_PHRASES.length : 0} разделов`);
  setText("arc-phrasal", `${typeof PHRASALS !== "undefined" ? PHRASALS.length : 0}`);
  setText("arc-assoc", `${Object.keys(ASSOC_OVERRIDES).length}`);
  if (typeof renderImportBox === "function") renderImportBox();
  // расписание повторов
  const sched = document.getElementById("arc-schedule");
  if (sched) {
    const rows = studyGroups().map((g) => ({ g, st: groupState(g) })).sort((a, b) => a.st.next.localeCompare(b.st.next));
    sched.innerHTML = rows.length ? rows.map(({ g, st }) => `<div class="sched-row">
        <span class="sched-label">${g.kind === "backlog" ? "" : fmtDay(g.date) + " · "}${escapeHtml(g.label)}</span>
        <span class="sched-next">${relDay(st.next)} · ${st.step + 1}-й</span>
      </div>`).join("") : `<div class="block-note">Пока пусто.</div>`;
  }
}
