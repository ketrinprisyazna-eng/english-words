/* ============ Синхронизация прогресса между устройствами через Firebase ============
   Работает поверх app.js: использует его глобальные PROGRESS/HISTORY/STREAK/DIRECTION
   и функции saveProgress/saveHistory/saveStreak/saveDirection (они вызывают
   CloudSync.schedulePush() после сохранения).

   Используется тот же Firebase-проект и тот же аккаунт, что и в приложении с испанскими
   словами. Документ тоже тот же — progress/{uid} (под него уже настроены правила Firestore),
   но английский прогресс лежит в отдельных полях EN_PROGRESS/EN_HISTORY/EN_STREAK/EN_DIRECTION
   и пишется с merge:true — испанские поля (PROGRESS/HISTORY/...) не затрагиваются.
   Если firebase-config.js не заполнен реальными ключами — модуль тихо отключается,
   приложение работает как раньше, только локально. */
(function () {
  const cfg = window.FIREBASE_CONFIG;
  const configured = cfg && cfg.apiKey && !String(cfg.apiKey).includes("ВСТАВЬ");

  if (!configured || typeof firebase === "undefined") {
    window.CloudSync = { enabled: false, schedulePush: function () {} };
    document.addEventListener("DOMContentLoaded", renderAccountBoxOffline);
    return;
  }

  firebase.initializeApp(cfg);
  const auth = firebase.auth();
  const db = firebase.firestore();

  let currentUser = null;
  let unsubscribeSnapshot = null;
  let applyingRemote = false;
  let pushTimer = null;

  function docRefFor(uid) {
    return db.collection("progress").doc(uid);
  }

  function collectLocalState() {
    return {
      EN_PROGRESS: PROGRESS,
      EN_HISTORY: HISTORY,
      EN_STREAK: STREAK,
      EN_DIRECTION: DIRECTION,
      EN_updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
  }

  function hasEnglishData(data) {
    return !!(data && data.EN_PROGRESS);
  }

  function applyRemoteState(data) {
    if (!hasEnglishData(data)) return;
    applyingRemote = true;
    try {
      if (data.EN_PROGRESS) { PROGRESS = data.EN_PROGRESS; saveJSON(LS_PROGRESS, PROGRESS); }
      if (data.EN_HISTORY) { HISTORY = data.EN_HISTORY; saveJSON(LS_HISTORY, HISTORY); }
      if (data.EN_STREAK) { STREAK = data.EN_STREAK; saveJSON(LS_STREAK, STREAK); }
      if (data.EN_DIRECTION) { DIRECTION = data.EN_DIRECTION; saveJSON(LS_DIRECTION, DIRECTION); }
      // Перерисовываем экран, только если DOM уже готов — иначе app.js сам отрисует
      // актуальные данные через DOMContentLoaded/showView("home").
      // Во время открытой сессии повторения не трогаем экран, чтобы не сбить карточку.
      if (document.readyState !== "loading" && !SESSION) {
        const activeView = document.querySelector(".view.active");
        if (activeView) showView(activeView.id.replace("view-", ""));
        document.querySelectorAll("#dir-toggle .filter-chip").forEach((el) => el.classList.toggle("active", el.dataset.dir === DIRECTION));
      }
    } finally {
      applyingRemote = false;
    }
  }

  function schedulePush() {
    if (!currentUser || applyingRemote) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(function () {
      docRefFor(currentUser.uid)
        .set(collectLocalState(), { merge: true })
        .catch(function (e) { console.warn("Не удалось синхронизировать прогресс:", e); });
    }, 800);
  }

  function attachSnapshot(uid) {
    if (unsubscribeSnapshot) unsubscribeSnapshot();
    unsubscribeSnapshot = docRefFor(uid).onSnapshot(
      function (snap) {
        if (!snap.exists) return;
        if (snap.metadata.hasPendingWrites) return; // это наша же запись, уже применена локально
        applyRemoteState(snap.data());
      },
      function (err) { console.warn("Не удалось получить обновления прогресса:", err); }
    );
  }

  async function pullOnce(uid) {
    const snap = await docRefFor(uid).get();
    if (snap.exists && hasEnglishData(snap.data())) {
      applyRemoteState(snap.data());
    } else {
      // английского прогресса в облаке ещё нет — выгружаем локальный (испанские поля не трогаем)
      await docRefFor(uid).set(collectLocalState(), { merge: true });
    }
  }

  function translateAuthError(e) {
    const map = {
      "auth/email-already-in-use": "Такой email уже зарегистрирован — попробуйте войти.",
      "auth/invalid-email": "Некорректный email.",
      "auth/weak-password": "Пароль слишком простой (минимум 6 символов).",
      "auth/user-not-found": "Пользователь не найден — зарегистрируйтесь.",
      "auth/wrong-password": "Неверный пароль.",
      "auth/invalid-credential": "Неверный email или пароль.",
      "auth/network-request-failed": "Нет соединения с интернетом.",
    };
    return map[e.code] || ("Ошибка: " + e.message);
  }

  function escapeHtmlLocal(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderAccountBox() {
    const box = document.getElementById("account-box");
    if (!box) return;
    if (currentUser) {
      box.innerHTML =
        '<div style="font-size:13px;color:var(--muted);margin-bottom:8px;">' +
        "Вошли как <b style=\"color:var(--text)\">" + escapeHtmlLocal(currentUser.email || "") + "</b> · " +
        "прогресс синхронизируется между устройствами" +
        "</div>" +
        '<button class="small-btn" id="btn-logout">Выйти</button>';
      document.getElementById("btn-logout").addEventListener("click", function () { auth.signOut(); });
    } else {
      box.innerHTML =
        '<div style="font-size:13px;color:var(--muted);margin-bottom:8px;">' +
        "Прогресс хранится только на этом устройстве. Войдите (тот же аккаунт, что и для испанского), чтобы видеть один и тот же прогресс на компьютере и телефоне." +
        "</div>" +
        '<button class="small-btn learn-btn" id="btn-open-login">🔄 Войти / синхронизировать</button>';
      document.getElementById("btn-open-login").addEventListener("click", openLoginModal);
    }
  }

  function openLoginModal() {
    document.getElementById("login-email").value = "";
    document.getElementById("login-password").value = "";
    document.getElementById("login-error").textContent = "";
    document.getElementById("login-modal").style.display = "flex";
  }
  function closeLoginModal() {
    document.getElementById("login-modal").style.display = "none";
  }

  async function handleAuth(mode) {
    const email = document.getElementById("login-email").value.trim();
    const pass = document.getElementById("login-password").value;
    const errEl = document.getElementById("login-error");
    errEl.textContent = "";
    if (!email || !pass) { errEl.textContent = "Введите email и пароль."; return; }
    try {
      if (mode === "register") {
        await auth.createUserWithEmailAndPassword(email, pass);
      } else {
        await auth.signInWithEmailAndPassword(email, pass);
      }
      closeLoginModal();
    } catch (e) {
      errEl.textContent = translateAuthError(e);
    }
  }

  auth.onAuthStateChanged(async function (user) {
    currentUser = user;
    renderAccountBox();
    if (user) {
      try { await pullOnce(user.uid); } catch (e) { console.warn("Не удалось загрузить прогресс:", e); }
      attachSnapshot(user.uid);
    } else if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
      unsubscribeSnapshot = null;
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    renderAccountBox();
    const btnLogin = document.getElementById("login-submit");
    const btnRegister = document.getElementById("register-submit");
    const btnClose = document.getElementById("login-close");
    if (btnLogin) btnLogin.addEventListener("click", function () { handleAuth("login"); });
    if (btnRegister) btnRegister.addEventListener("click", function () { handleAuth("register"); });
    if (btnClose) btnClose.addEventListener("click", closeLoginModal);
  });

  window.CloudSync = { enabled: true, schedulePush: schedulePush };
})();

function renderAccountBoxOffline() {
  const box = document.getElementById("account-box");
  if (!box) return;
  box.innerHTML =
    '<div style="font-size:13px;color:var(--muted);">' +
    "Синхронизация между устройствами не настроена. Прогресс хранится только на этом устройстве." +
    "</div>";
}
