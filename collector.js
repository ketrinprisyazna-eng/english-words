/* Сборщик для закладки «Мой английский».
   Закладка — короткий загрузчик, который подключает этот файл на duolingo.com или
   puzzle-english.com. Он собирает свежие слова, ошибки и ключевые фразы и открывает
   приложение с данными в «хвосте» адреса (#import=…). Обновления этого файла
   доходят до закладки сами — переставлять её не нужно. */
function enappCollector(APP) {
  (async () => {
    const note = (t) => {
      let d = document.getElementById("enapp-note");
      if (!d) {
        d = document.createElement("div");
        d.id = "enapp-note";
        d.style.cssText = "position:fixed;z-index:2147483647;left:50%;top:16px;transform:translateX(-50%);background:#221C14;color:#FBF7EF;padding:12px 16px;border-radius:12px;font:15px system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.3);max-width:90vw";
        document.body.appendChild(d);
      }
      d.textContent = t;
    };
    try {
      let payload;
      if (/(^|\.)duolingo\.com$/.test(location.hostname)) {
        note("Собираю новые слова и ошибки из Duolingo…");
        const m = document.cookie.match(/jwt_token=([^;]+)/);
        if (!m) throw new Error("войди в Duolingo на этом сайте и нажми закладку ещё раз");
        const jwt = m[1];
        const uid = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).sub;
        const H = { Authorization: "Bearer " + jwt };
        const u = await fetch(`/2017-06-30/users/${uid}?fields=currentCourse,learningLanguage,fromLanguage`, { headers: H, credentials: "include" }).then((r) => r.json());
        const cc = u.currentCourse;
        const L = u.learningLanguage || "en", F = u.fromLanguage || "ru";
        const units = [];
        const skills = {};
        for (const sec of cc.pathSectioned || []) for (const un of sec.units || []) {
          const lv = un.levels || [];
          units.push({ i: un.unitIndex, t: un.teachingObjective || "", c: un.cefrLevel || "", g: un.guidebook && un.guidebook.url, p: lv.filter((l) => l.state === "passed").length, n: lv.length });
          for (const l of lv) {
            const sid = l.pathLevelMetadata && l.pathLevelMetadata.skillId;
            if (!sid || (l.state !== "passed" && l.state !== "active" && !(l.finishedSessions > 0))) continue;
            if (!skills[sid]) skills[sid] = { finishedLevels: 0, finishedSessions: 0, skillId: { id: sid } };
            if (l.state === "passed") skills[sid].finishedLevels++;
            skills[sid].finishedSessions += l.finishedSessions || 0;
          }
        }
        const lx = await fetch(`/2017-06-30/users/${uid}/courses/${L}/${F}/learned-lexemes?limit=300&sortBy=LEARNED_DATE&startIndex=0`, {
          method: "POST", headers: { ...H, "Content-Type": "application/json" }, credentials: "include",
          body: JSON.stringify({ lastTotalLexemeCount: 0, progressedSkills: Object.values(skills) }),
        }).then((r) => r.json());
        const mk = await fetch(`/v2/mistakes/users/${uid}/courses/${cc.id}?includeListening=true&includeSpeaking=true&limit=500&requestType=INBOX`, { headers: H, credentials: "include" })
          .then((r) => r.json()).catch(() => ({ mistakes: [] }));
        const recent = units.filter((x) => x.p > 0).sort((a, b) => a.i - b.i).slice(-12);
        const st = (x) => (x && x.styledString && x.styledString.text) || "";
        const guides = {};
        for (const g of [...new Set(recent.map((x) => x.g).filter(Boolean))]) {
          try {
            const j = await fetch(g).then((r) => r.json());
            const ph = [];
            for (const e of j.elements || []) if (e.type === "dialogue") for (const p of e.element.phrases) ph.push([st(p.text), st(p.subtext)]);
            guides[g] = ph;
          } catch (e) {}
        }
        payload = {
          src: "duo", at: Date.now(), total: lx.pagination && lx.pagination.totalLexemes,
          words: (lx.learnedLexemes || []).map((l) => [l.text, (l.translations || []).slice(0, 3).join(", ")]),
          mistakes: (mk.mistakes || []).filter((x) => x.maxAIUserResponse || x.maxAICorrectResponse).map((x) => ({
            id: x.challengeIdentifier.generatorId + ":" + x.timestamp, ts: x.timestamp, k: x.challengeIdentifier.specificType,
            p: x.prompt || x.maxAIChallengePrompt || "", u: x.maxAIUserResponse || "", c: x.maxAIAnnotatedSolution || x.maxAICorrectResponse || "",
          })),
          units: recent.map((x) => ({ i: x.i, t: x.t, c: x.c, p: x.p, n: x.n, ph: (x.g && guides[x.g]) || [] })),
        };
      } else if (/(^|\.)puzzle-english\.com$/.test(location.hostname)) {
        note("Собираю слова из «Моего словаря» Puzzle English…");
        const out = [];
        const parse = (doc) => {
          for (const head of doc.querySelectorAll(".puzzle-card__head")) {
            const card = head.closest(".box-to-delete") || head.parentElement.parentElement;
            const t = (s) => ((card.querySelector(s) || {}).textContent || "").replace(/\s+/g, " ").trim();
            out.push([t(".puzzle-card__eng-word"), t(".puzzle-card__rus-word"), t(".puzzle-card__accents-text-transcription")]);
          }
        };
        const page = async (n) => new DOMParser().parseFromString(await fetch("/dictionary?view=cards&item=word&page=" + n, { credentials: "include" }).then((r) => r.text()), "text/html");
        const first = await page(1);
        const pages = Math.max(1, ...[...first.querySelectorAll("a")].map((a) => { try { return +new URL(a.href).searchParams.get("page") || 0; } catch (e) { return 0; } }));
        parse(first);
        for (let n = 2; n <= pages; n++) parse(await page(n));
        payload = { src: "puzzle", at: Date.now(), words: out.filter((w) => w[0]) };
      } else {
        alert("Открой duolingo.com или puzzle-english.com и нажми закладку там.");
        return;
      }
      note("Отправляю в «Мой английский»…");
      const gz = await new Response(new Blob([new TextEncoder().encode(JSON.stringify(payload))]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer();
      const bytes = new Uint8Array(gz);
      let bin = "";
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      location.href = APP + "#import=" + btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } catch (e) {
      note("Не получилось: " + e.message);
    }
  })();
}

enappCollector((document.currentScript && document.currentScript.src || "https://ketrinprisyazna-eng.github.io/english-words/collector.js").replace(/collector\.js.*$/, ""));
