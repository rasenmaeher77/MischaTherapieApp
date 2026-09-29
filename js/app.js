/* =========================================================
   Mischa Therapie App
   Anmeldung: Firebase Authentication (E-Mail/Passwort)
   Daten:     Firestore, Sammlung "termine"
              { name, zukunft, rueckblick, erstelltAm }
   ========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  initializeFirestore, getFirestore, persistentLocalCache, persistentMultipleTabManager,
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

/* Offline-Funktion (Service Worker) */
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(function (err) {
    console.warn("Service Worker konnte nicht registriert werden:", err);
  });
}

const $ = (id) => document.getElementById(id);

/* ===== Zustand ===== */

let termine = [];            // alle Termine, zuletzt hinzugefügt zuerst
let stopTermine = null;      // beendet die Live-Verbindung zu Firestore
let naechsterId = null;      // ID des Termins auf der Startseite
let offenerId = null;        // ID des Termins im Terminfenster (null = neu)
let terminModus = "ansicht"; // "ansicht" | "bearbeiten"
let formStart = "";          // Formularinhalt beim Öffnen (für "ungespeichert?")
let listeModus = "ansehen";  // "ansehen" | "loeschen"

/* ===== Firebase starten ===== */

if (firebaseConfig.apiKey === "HIER_EINTRAGEN") {
  $("laden").textContent = "Bitte zuerst js/firebase-config.js ausfüllen (siehe README).";
  throw new Error("Firebase-Konfiguration fehlt");
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Lokaler Speicher: Termine sind offline verfügbar, Änderungen werden später synchronisiert
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
} catch (err) {
  console.warn("Offline-Speicher nicht verfügbar:", err);
  db = getFirestore(app);
}

const termineRef = collection(db, "termine");

/* ===== Anmeldung ===== */

onAuthStateChanged(auth, (user) => {
  $("laden").hidden = true;
  $("login").hidden = !!user;
  $("start").hidden = !user;

  if (user) {
    starteTermine();
  } else {
    if (stopTermine) stopTermine();
    stopTermine = null;
    termine = [];
    fensterSchliessen("termin", true);
    fensterSchliessen("liste");
  }
});

$("login").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = event.submitter || $("login").querySelector("button");
  const fehler = $("login-fehler");
  fehler.hidden = true;
  button.disabled = true;

  try {
    await signInWithEmailAndPassword(auth, $("login-email").value.trim(), $("login-passwort").value);
    $("login-passwort").value = "";
  } catch (err) {
    fehler.textContent = loginFehlertext(err.code);
    fehler.hidden = false;
  } finally {
    button.disabled = false;
  }
});

function loginFehlertext(code) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/invalid-email":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-Mail oder Passwort ist falsch.";
    case "auth/too-many-requests":
      return "Zu viele Versuche. Bitte später erneut probieren.";
    case "auth/network-request-failed":
      return "Keine Internetverbindung.";
    default:
      return "Anmeldung fehlgeschlagen (" + code + ").";
  }
}

$("btn-abmelden").addEventListener("click", () => {
  if (confirm("Wirklich abmelden?")) signOut(auth);
});

/* ===== Termine laden (live) ===== */

function starteTermine() {
  if (stopTermine) return;

  stopTermine = onSnapshot(termineRef, (snapshot) => {
    termine = snapshot.docs.map((d) => {
      // "estimate": frisch (offline) angelegte Termine haben schon eine vorläufige Zeit
      const data = d.data({ serverTimestamps: "estimate" });
      return {
        id: d.id,
        name: data.name || "",
        zukunft: data.zukunft || "",
        rueckblick: data.rueckblick || "",
        zeit: data.erstelltAm ? data.erstelltAm.toMillis() : Date.now()
      };
    });
    termine.sort((a, b) => b.zeit - a.zeit);
    allesAnzeigen();
  }, (err) => {
    console.error(err);
    alert(err.code === "permission-denied"
      ? "Keine Berechtigung, die Termine zu lesen. Stimmt die UID in den Firestore-Regeln?"
      : "Termine konnten nicht geladen werden (" + err.code + ").");
  });
}

function findeTermin(id) {
  return termine.find((t) => t.id === id) || null;
}

/* ===== Anzeige ===== */

function allesAnzeigen() {
  naechstenAnzeigen();
  if (!$("liste-fenster").hidden) listeAnzeigen();

  // Offenes Terminfenster aktualisieren (oder schließen, falls der Termin gelöscht wurde)
  if (!$("termin-fenster").hidden && terminModus === "ansicht") {
    if (findeTermin(offenerId)) ansichtAnzeigen();
    else fensterSchliessen("termin", true);
  }
}

function naechstenAnzeigen() {
  const termin = termine[0] || null;

  $("naechster-titel").textContent = termin
    ? "Nächster Termin: „" + termin.name + "“"
    : "Nächster Termin";
  $("naechster-leer").hidden = !!termin;
  $("naechster-inhalt").hidden = !termin;
  $("naechster-bearbeiten").hidden = !termin;
  if (!termin) return;

  // Anderer Termin oben → Bereiche wieder zuklappen
  if (termin.id !== naechsterId) {
    document.querySelectorAll(".aufklapper").forEach((b) => aufklappen(b, false));
    naechsterId = termin.id;
  }

  $("naechster-zukunft").textContent = termin.zukunft || "–";
  $("naechster-rueckblick").textContent = termin.rueckblick || "–";
}

function aufklappen(button, offen) {
  button.setAttribute("aria-expanded", String(offen));
  $(button.getAttribute("aria-controls")).hidden = !offen;
}

document.querySelectorAll(".aufklapper").forEach((button) => {
  button.addEventListener("click", () => {
    aufklappen(button, button.getAttribute("aria-expanded") !== "true");
  });
});

$("naechster-bearbeiten").addEventListener("click", () => {
  if (naechsterId) terminOeffnen(naechsterId, "bearbeiten");
});

/* ===== Fenster allgemein ===== */

function fensterOeffnen(name) {
  $(name + "-fenster").hidden = false;
  $(name + "-fenster").scrollTop = 0;
  document.body.classList.add("fenster-offen");
}

// ohneNachfrage: ungespeicherte Änderungen ohne Rückfrage verwerfen
function fensterSchliessen(name, ohneNachfrage) {
  if (name === "termin" && !ohneNachfrage && terminModus === "bearbeiten" &&
      !$("termin-fenster").hidden && formularInhalt() !== formStart &&
      !confirm("Ungespeicherte Änderungen verwerfen?")) {
    return;
  }
  $(name + "-fenster").hidden = true;
  if ($("liste-fenster").hidden && $("termin-fenster").hidden) {
    document.body.classList.remove("fenster-offen");
  }
}

document.querySelectorAll("[data-schliessen]").forEach((button) => {
  button.addEventListener("click", () => fensterSchliessen(button.dataset.schliessen));
});

// Tippen auf den abgedunkelten Hintergrund schließt das Fenster
document.querySelectorAll(".overlay").forEach((overlay) => {
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) fensterSchliessen(overlay.id.replace("-fenster", ""));
  });
});

/* ===== Terminfenster ===== */

// id = null → neuer Termin
function terminOeffnen(id, modus) {
  offenerId = id;
  terminModus = modus;

  if (modus === "ansicht") {
    ansichtAnzeigen();
  } else {
    const termin = id ? findeTermin(id) : null;
    $("termin-titel").textContent = termin ? "Termin bearbeiten" : "Neuer Termin";
    $("feld-name").value = termin ? termin.name : "";
    $("feld-zukunft").value = termin ? termin.zukunft : "";
    $("feld-rueckblick").value = termin ? termin.rueckblick : "";
    formStart = formularInhalt();
  }

  $("termin-ansicht").hidden = modus !== "ansicht";
  $("termin-form").hidden = modus === "ansicht";
  fensterOeffnen("termin");
}

function ansichtAnzeigen() {
  const termin = findeTermin(offenerId);
  if (!termin) return;
  $("termin-titel").textContent = "Termin: „" + termin.name + "“";
  $("ansicht-zukunft").textContent = termin.zukunft || "–";
  $("ansicht-rueckblick").textContent = termin.rueckblick || "–";
}

function formularInhalt() {
  return JSON.stringify([$("feld-name").value, $("feld-zukunft").value, $("feld-rueckblick").value]);
}

$("ansicht-bearbeiten").addEventListener("click", () => terminOeffnen(offenerId, "bearbeiten"));

$("btn-hinzufuegen").addEventListener("click", () => terminOeffnen(null, "bearbeiten"));

$("termin-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const daten = {
    name: $("feld-name").value.trim(),
    zukunft: $("feld-zukunft").value.trim(),
    rueckblick: $("feld-rueckblick").value.trim()
  };
  if (!daten.name) {
    $("feld-name").focus();
    return;
  }

  // Nicht auf den Server warten: offline landet die Änderung im lokalen Speicher
  // und wird automatisch hochgeladen, sobald wieder Internet da ist.
  const speichern = offenerId
    ? updateDoc(doc(termineRef, offenerId), daten)
    : setDoc(doc(termineRef), { ...daten, erstelltAm: serverTimestamp() });
  speichern.catch(schreibFehler);

  fensterSchliessen("termin", true);
});

function schreibFehler(err) {
  console.error(err);
  alert(err.code === "permission-denied"
    ? "Keine Berechtigung zum Speichern. Stimmt die UID in den Firestore-Regeln?"
    : "Speichern fehlgeschlagen (" + err.code + ").");
}

/* ===== Liste: Vergangene Termine / Termin löschen ===== */

$("btn-liste").addEventListener("click", () => listeOeffnen("ansehen"));
$("btn-loeschen").addEventListener("click", () => listeOeffnen("loeschen"));

function listeOeffnen(modus) {
  listeModus = modus;
  $("liste-titel").textContent = modus === "loeschen" ? "Termin löschen" : "Vergangene Termine";
  listeAnzeigen();
  fensterOeffnen("liste");
}

const ICON_BEARBEITEN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4"/></svg>';
const ICON_LOESCHEN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>';

function listeAnzeigen() {
  const liste = $("liste");
  liste.replaceChildren();
  $("liste-leer").hidden = termine.length > 0;

  termine.forEach((termin) => {
    const li = document.createElement("li");

    const eintrag = document.createElement("button");
    eintrag.type = "button";
    eintrag.className = "eintrag";
    eintrag.textContent = termin.name;

    const icon = document.createElement("button");
    icon.type = "button";

    if (listeModus === "loeschen") {
      icon.className = "icon-button loeschen";
      icon.innerHTML = ICON_LOESCHEN;
      icon.setAttribute("aria-label", "„" + termin.name + "“ löschen");
      eintrag.addEventListener("click", () => terminLoeschen(termin));
      icon.addEventListener("click", () => terminLoeschen(termin));
    } else {
      icon.className = "icon-button";
      icon.innerHTML = ICON_BEARBEITEN;
      icon.setAttribute("aria-label", "„" + termin.name + "“ bearbeiten");
      eintrag.addEventListener("click", () => terminOeffnen(termin.id, "ansicht"));
      icon.addEventListener("click", () => terminOeffnen(termin.id, "bearbeiten"));
    }

    li.append(eintrag, icon);
    liste.append(li);
  });
}

function terminLoeschen(termin) {
  if (!confirm("Termin „" + termin.name + "“ wirklich löschen?")) return;
  deleteDoc(doc(termineRef, termin.id)).catch(schreibFehler);
}

/* ===== Offline-Hinweis ===== */

function onlineStatus() {
  $("offline-hinweis").hidden = navigator.onLine;
}
window.addEventListener("online", onlineStatus);
window.addEventListener("offline", onlineStatus);
onlineStatus();
