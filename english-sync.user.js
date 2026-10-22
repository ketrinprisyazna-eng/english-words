// ==UserScript==
// @name         Мой английский — обновление в одно касание
// @namespace    https://ketrinprisyazna-eng.github.io/english-words/
// @version      1.0
// @description  По кнопке «Обновить» в приложении сам собирает новые слова, ошибки и ключевые фразы на duolingo.com или puzzle-english.com и возвращается в приложение.
// @match        https://www.duolingo.com/*
// @match        https://puzzle-english.com/*
// @match        https://ketrinprisyazna-eng.github.io/english-words/*
// @run-at       document-start
// @grant        none
// @downloadURL  https://ketrinprisyazna-eng.github.io/english-words/english-sync.user.js
// @updateURL    https://ketrinprisyazna-eng.github.io/english-words/english-sync.user.js
// ==/UserScript==

(function () {
  "use strict";
  var APP = "https://ketrinprisyazna-eng.github.io/english-words/";
  var FLAG = "enapp-sync";

  // В самом приложении: отмечаем, что скрипт установлен, — тогда там появляется кнопка «Обновить».
  if (location.hostname === "ketrinprisyazna-eng.github.io") {
    try { localStorage.setItem("enapp_userscript", "1.0"); } catch (e) {}
    return;
  }

  // На Duolingo / Puzzle English: работаем, только если страницу открыла кнопка «Обновить»
  // (адрес с #enapp-sync). Флаг держим в sessionStorage — сайт может переписать адрес.
  if (location.hash.indexOf(FLAG) >= 0) {
    try { sessionStorage.setItem(FLAG, String(Date.now())); } catch (e) {}
    history.replaceState(null, "", location.pathname + location.search);
  }
  var started = 0;
  try { started = +sessionStorage.getItem(FLAG) || 0; } catch (e) {}
  if (!started || Date.now() - started > 120000) return;
  try { sessionStorage.removeItem(FLAG); } catch (e) {}

  // Тот же сборщик, что и у закладки: собирает данные и открывает приложение с ними.
  function run() {
    var s = document.createElement("script");
    s.src = APP + "collector.js?" + Date.now();
    (document.body || document.documentElement).appendChild(s);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(run, 800); });
  } else {
    setTimeout(run, 800);
  }
})();
