/* =========================================================
   Mischa App – JavaScript
   ========================================================= */

/* ---------- Hilfsfunktion: sicheres Speichern ----------
   (z. B. im privaten Modus kann localStorage blockiert sein) */
var storage = {
  get: function (key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  set: function (key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      /* Speichern nicht möglich – ignorieren */
    }
  }
};

(function () {
  "use strict";

  const pages = document.querySelectorAll(".page");
  const tabs = document.querySelectorAll(".tab");
  const titleEl = document.getElementById("page-title");
  const content = document.getElementById("content");
  const defaultPage = pages[0].id;

  /* ---------- Navigation zwischen den Seiten ----------
     Die Seite wird über die Adresse gewählt, z. B. index.html#info.
     So funktionieren auch Zurück-Wischen und Lesezeichen. */
  function showPage() {
    const id = location.hash.slice(1);
    const target = document.getElementById(id);
    const pageId = target && target.classList.contains("page") ? id : defaultPage;

    pages.forEach(function (page) {
      page.hidden = page.id !== pageId;
    });

    tabs.forEach(function (tab) {
      const isActive = tab.getAttribute("href") === "#" + pageId;
      tab.classList.toggle("active", isActive);
      if (isActive) {
        tab.setAttribute("aria-current", "page");
      } else {
        tab.removeAttribute("aria-current");
      }
    });

    const page = document.getElementById(pageId);
    titleEl.textContent = page.dataset.title || "";
    content.scrollTop = 0;
  }

  // Antippen des bereits aktiven Tabs scrollt nach oben (wie in iOS-Apps)
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function (event) {
      if (tab.classList.contains("active")) {
        event.preventDefault();
        content.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });

  window.addEventListener("hashchange", showPage);
  showPage();

  /* ---------- Beispiel: Button ---------- */
  const demoButton = document.getElementById("demo-button");
  const demoOutput = document.getElementById("demo-output");
  let taps = 0;

  if (demoButton) {
    demoButton.addEventListener("click", function () {
      taps += 1;
      demoOutput.textContent = "Du hast " + taps + "× getippt.";
    });
  }

  /* ---------- Beispiel: Eingabe auf dem Gerät speichern ----------
     localStorage bleibt erhalten, auch wenn die App geschlossen wird. */
  const demoInput = document.getElementById("demo-input");

  if (demoInput) {
    demoInput.value = storage.get("notiz") || "";
    demoInput.addEventListener("input", function () {
      storage.set("notiz", demoInput.value);
    });
  }

  /* ---------- Offline-Funktion (Service Worker) ---------- */
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function (err) {
        console.warn("Service Worker konnte nicht registriert werden:", err);
      });
    });
  }
})();
