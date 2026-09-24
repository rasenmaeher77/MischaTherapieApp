# Mischa App

Eine schlanke Web-App (HTML, CSS, JavaScript) ohne Frameworks – optimiert für das iPhone.
Sie lässt sich über GitHub Pages veröffentlichen und wie eine richtige App zum Home-Bildschirm hinzufügen.

## Dateien

| Datei / Ordner          | Zweck                                                               |
|-------------------------|---------------------------------------------------------------------|
| `index.html`            | Aufbau und **Inhalte** der App (hier arbeitest du am meisten)       |
| `css/style.css`         | Aussehen: Farben, Abstände, Schriften                               |
| `js/app.js`             | Funktionen: Seitenwechsel, Buttons, Speichern                       |
| `manifest.webmanifest`  | Name, Icon und Farben der App auf dem Home-Bildschirm               |
| `sw.js`                 | Offline-Funktion (App läuft auch ohne Internet)                     |
| `icons/`                | App-Icons (180 × 180, 192 × 192, 512 × 512 Pixel, PNG)              |
| `.nojekyll`             | Sorgt dafür, dass GitHub Pages alle Dateien unverändert ausliefert  |

## 1. Auf GitHub hochladen

1. Auf [github.com](https://github.com) anmelden → oben rechts **+** → **New repository**.
2. Namen vergeben (z. B. `mischa-app`), **Public** wählen → **Create repository**.
3. Auf **uploading an existing file** klicken und **alle Dateien und Ordner** aus diesem Ordner hineinziehen
   (auch `.nojekyll` – im Finder versteckte Dateien mit `Cmd + Shift + .` einblenden).
4. **Commit changes** klicken.

## 2. Als Website veröffentlichen (GitHub Pages)

1. Im Repository: **Settings** → **Pages**.
2. Bei *Source*: **Deploy from a branch**, Branch **main**, Ordner **/ (root)** → **Save**.
3. Nach 1–2 Minuten ist die App erreichbar unter:
   `https://DEIN-BENUTZERNAME.github.io/mischa-app/`

## 3. Auf dem iPhone installieren

1. Die Adresse in **Safari** öffnen.
2. Unten auf das **Teilen-Symbol** (Quadrat mit Pfeil) tippen.
3. **Zum Home-Bildschirm** wählen → **Hinzufügen**.

Die App startet jetzt im Vollbild ohne Safari-Leisten und funktioniert nach dem ersten Öffnen auch offline.

## Inhalte bearbeiten

**Text ändern:** In `index.html` den Text zwischen den Tags ersetzen, z. B. in `<div class="card"> … </div>`.

**Neue Seite hinzufügen:**

1. In `index.html` innerhalb von `<main>` eine neue Seite anlegen:
   ```html
   <section class="page" id="rezepte" data-title="Rezepte" hidden>
     <div class="card">
       <h2>Meine Rezepte</h2>
       <p>…</p>
     </div>
   </section>
   ```
2. In der `<nav class="tabbar">` einen passenden Tab ergänzen (`href` = `#` + `id` der Seite):
   ```html
   <a class="tab" href="#rezepte">
     <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/></svg>
     <span>Rezepte</span>
   </a>
   ```
   Tipp: Mehr als 5 Tabs passen auf dem iPhone nicht gut nebeneinander.

**Fertige Bausteine** (Klassen in `style.css`): `card` (Karte), `list` (Liste), `section-title` (kleine Überschrift),
`button` (Button), `input` + `label` (Eingabefeld), `muted` (grauer Nebentext).

**Farben ändern:** Oben in `css/style.css` unter `:root` (heller Modus) und `@media (prefers-color-scheme: dark)` (dunkler Modus).

**App-Name ändern:** In `index.html` (`<title>` und `apple-mobile-web-app-title`) und in `manifest.webmanifest`.

**Eigenes Icon:** Die drei PNG-Dateien in `icons/` durch eigene quadratische Bilder mit denselben Namen und Größen ersetzen
(ohne abgerundete Ecken und ohne Transparenz – das iPhone rundet selbst ab).

**Bilder einbinden:** Einen Ordner `images/` anlegen, Bild hineinlegen und mit `<img src="images/foto.jpg" alt="Beschreibung">` einfügen.
Damit das Bild auch offline verfügbar ist, den Pfad zusätzlich in `sw.js` in die Liste `FILES` eintragen.

## Änderungen veröffentlichen

Geänderte Dateien auf GitHub erneut hochladen (**Add file → Upload files**). Nach 1–2 Minuten ist die neue Version online.
Die App auf dem iPhone lädt bei bestehender Internetverbindung automatisch die neueste Version – ggf. die App einmal
komplett schließen (nach oben wischen) und neu öffnen.

Wenn du `icons/` oder `manifest.webmanifest` änderst, die App vom Home-Bildschirm löschen und neu hinzufügen,
damit das iPhone Name und Icon neu übernimmt.

## Lokal am Mac testen

Im Terminal in diesem Ordner:

```bash
python3 -m http.server 8000
```

Dann im Browser `http://localhost:8000` öffnen. Für die iPhone-Ansicht in Safari: **Entwickeln → Responsive Design Mode**.
