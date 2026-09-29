# Mischa Therapie App

Private, für das iPhone optimierte Web-App (HTML, CSS, JavaScript, keine Frameworks).
Die Termine liegen in **Firebase Firestore**. Lesen und ändern darf nur, wer mit **deinem**
Konto angemeldet ist (Firebase Authentication, E-Mail/Passwort).

| Datei / Ordner          | Zweck                                                         |
|-------------------------|---------------------------------------------------------------|
| `index.html`            | Aufbau: Anmeldung, Startseite, Liste, Terminfenster           |
| `css/style.css`         | Aussehen – Farben ganz oben in `:root` anpassen               |
| `js/app.js`             | Logik: Anmeldung, Termine laden/speichern/löschen             |
| `js/firebase-config.js` | Zugangsdaten deines Firebase-Projekts (dürfen öffentlich sein) |
| `firestore.rules`       | Sicherheitsregeln – werden in der Firebase-Konsole eingefügt  |
| `manifest.webmanifest`  | Name, Icon und Farben auf dem Home-Bildschirm                 |
| `sw.js`                 | Service Worker (Offline-Funktion)                             |
| `icons/`                | App-Icons (180, 192, 512 px)                                  |

## Einrichtung (einmalig)

### 1. Firebase-Projekt anlegen
1. <https://console.firebase.google.com> öffnen → **Projekt hinzufügen**.
   Name z. B. `mischa-therapie`. Google Analytics wird nicht gebraucht.
2. In der Projektübersicht auf das Web-Symbol **`</>`** klicken, einen Namen eingeben
   (Firebase Hosting **nicht** anhaken) → **App registrieren**.
3. Die angezeigten Werte (`apiKey`, `authDomain`, …) in `js/firebase-config.js` übertragen.

### 2. Anmeldung einrichten
1. Links **Build → Authentication → Jetzt starten**.
2. Reiter **Anmeldemethode** → **E-Mail-Adresse/Passwort** → nur den ersten Schalter aktivieren → Speichern.
3. Reiter **Nutzer** → **Nutzer hinzufügen** → deine E-Mail und ein sicheres Passwort.
4. Die **Nutzer-UID** der neuen Zeile kopieren – die brauchst du gleich.

### 3. Datenbank einrichten
1. Links **Build → Firestore Database → Datenbank erstellen**.
2. Standort in Europa wählen (z. B. `europe-west3` Frankfurt) – lässt sich später nicht ändern.
3. **Im Produktionsmodus starten** (nicht Testmodus).
4. Reiter **Regeln**: Den gesamten Inhalt durch `firestore.rules` ersetzen,
   `HIER_DEINE_UID_EINTRAGEN` durch deine UID ersetzen → **Veröffentlichen**.

### 4. Online stellen (GitHub Pages)
1. Alle Dateien auf GitHub hochladen (Branch `main`).
2. Im Repository **Settings → Pages** → Source „Deploy from a branch“, Branch `main`, Ordner `/ (root)`.
3. Nach 1–2 Minuten ist die App unter `https://rasenmaeher77.github.io/MischaTherapieApp/` erreichbar.
4. Empfohlen: In Firebase unter **Authentication → Einstellungen → Autorisierte Domains**
   `rasenmaeher77.github.io` hinzufügen.

### 5. Auf dem iPhone installieren
Seite in **Safari** öffnen → Teilen-Symbol → **Zum Home-Bildschirm**.
Die App auf dem Home-Bildschirm hat einen eigenen Speicher, du musst dich dort also einmal
separat anmelden. Danach bleibst du angemeldet.

## Sicherheit – warum ist das geschützt?

- Die Werte in `firebase-config.js` sind **kein Passwort**; sie sagen nur, welches Projekt gemeint ist.
- Geschützt wird alles durch die **Firestore-Regeln** auf dem Google-Server: Nur die eingetragene
  UID darf lesen oder schreiben. Selbst wenn sich jemand über die öffentliche Konfiguration ein
  eigenes Konto anlegen würde, hätte er eine andere UID und bekommt keine Daten.
- Die Regeln prüfen zusätzlich, dass nur die erwarteten Felder in sinnvoller Länge gespeichert werden.

## Offline

Termine werden auf dem Gerät zwischengespeichert. Ohne Internet kannst du sie lesen, anlegen,
bearbeiten und löschen – die Änderungen werden hochgeladen, sobald wieder Internet da ist.
Die allererste Anmeldung braucht Internet.

## Lokal testen

Im Projektordner `python3 -m http.server 8000` ausführen und <http://localhost:8000> öffnen
(`localhost` ist in Firebase standardmäßig erlaubt).

## Änderungen veröffentlichen

Dateien ändern und auf GitHub hochladen. Bei neuen Dateien diese in `sw.js` unter `FILES`
eintragen und `CACHE` hochzählen (z. B. `mischa-therapie-v2`).
