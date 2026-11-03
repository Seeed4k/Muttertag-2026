# Webhafen Cockpit

Eigene Marketing- und Vertriebs-Software für Webhafen: CRM, Lead-Pipelines mit Prognose,
Social Planner, Affiliate-Manager, Trigger-Links und automatische Website-Checks für die
Kundenakquise – in **einer** App, ohne monatliche Lizenzkosten.

- **Keine Abhängigkeiten**: nur Node.js ≥ 22.13 (die Datenbank SQLite ist eingebaut)
- **Kein Build-Schritt**: `npm start` und fertig
- Alle Daten liegen in einer Datei: `data/cockpit.db` (zum Sichern einfach kopieren)

## Starten

```bash
cd webhafen-cockpit
ADMIN_PASSWORD='ein-langes-passwort' npm start
# → http://localhost:3000
```

Ohne `ADMIN_PASSWORD` ist die App **ohne Login** erreichbar – nur lokal so betreiben.

| Umgebungsvariable | Wozu |
|---|---|
| `ADMIN_PASSWORD` | Passwort für den Login (Pflicht auf einem Server) |
| `PORT` | Port, Standard `3000` |
| `DB_FILE` | Pfad zur Datenbank, Standard `data/cockpit.db` |
| `TZ` | Zeitzone für geplante Beiträge, Standard `Europe/Berlin` |
| `HTTPS` | `1` setzen, wenn die App hinter HTTPS läuft (sichere Cookies) |
| `GOOGLE_PLACES_API_KEY` | optional: Google-Unternehmensprofil & Bewertungen im Website-Check |
| `PAGESPEED_API_KEY` | optional: eigenes Kontingent für Google-PageSpeed-Messungen |

Tests: `npm test`

## Was die App kann

### 👥 Kontakte
Kontakte anlegen, durchsuchen, taggen, per CSV importieren.

### 🎯 Leads (Pipelines)
- Kanban-Board mit Drag & Drop zwischen den Phasen
- „Neuen Lead hinzufügen“ mit Ansprechpartner (bestehend oder neu), Pipeline, Phase, Status
  (Offen/Gewonnen/Verloren/Aufgegeben), Wert, Verantwortlicher, Follower, Firma, Quelle,
  erwartetes Abschlussdatum, Tags, Notizen
- Listenansicht mit **Massenaktionen** (Status, Phase, Tag, Löschen) und CSV-Import
- Pipelines frei anlegen: Phasen, Reihenfolge, Farbe, Wahrscheinlichkeit je Phase oder je Lead

### 📊 Prognose
- Maximale potenzielle, erwartete (Wert × Wahrscheinlichkeit) und gewonnene Einnahmen
- **Gefährdete Leads**: Das Cockpit merkt sich, wenn ein Abschlussdatum nach hinten verschoben
  wird → hohes Risiko (2× oder 14+ Tage), mittleres (7+ Tage), geringes
- Datenqualität: fehlendes Abschlussdatum, fehlender Wert, überfällige Leads
- Gruppierung nach Status oder Phase, Zeitachse nach Abschlussmonat

### 📣 Social Planner
- Konten für Facebook, Instagram, LinkedIn, TikTok, YouTube, Pinterest, Threads, Bluesky,
  Google-Unternehmensprofil, X, Community
- Beiträge **einmalig planen**, **wiederkehrend** (z. B. Di + Do 9:00), als **Evergreen-Warteschlange**
  (Kategorien, die reihum ihre Beiträge recyceln) oder als Entwurf
- **Massenplanung per CSV**, **RSS-Feed → Beiträge** (als Entwurf oder automatisch)
- Kalenderansicht, Protokoll je Beitrag, „Jetzt posten“, Testbeitrag je Konto

**Wie wird veröffentlicht?** Facebook, Instagram, LinkedIn, TikTok & YouTube lassen automatisches
Posten nur über Entwickler-Apps zu, die die Plattform erst prüfen und freischalten muss.
Das Cockpit übergibt deshalb jeden fälligen Beitrag an einen **Webhook** – am einfachsten ein
Szenario in [Make](https://make.com), Zapier oder n8n, das dort mit dem jeweiligen Konto
verbunden ist und postet:

```json
POST <Webhook-URL>
{ "platform": "instagram", "account": "Webhafen Instagram", "post_id": 12,
  "content": "…", "media_url": "https://…", "link": "https://…", "sent_at": "2026-11-05T08:00:00.000Z" }
```

**Bluesky** ist direkt angebunden (Handle + App-Passwort). Konten ohne Webhook werden zur
fälligen Zeit als „Manuell posten“ markiert.

### 🤝 Affiliate-Manager
- Kampagnen mit Ziel (Funnel, Website, Shop, externe Seite, Formular, Umfrage, Kalender),
  Provision in % oder als Festbetrag, Cookie-Laufzeit
- Affiliates mit eigenem Tracking-Link `https://deine-app/go/CODE` → zählt Klicks und leitet auf
  `Ziel-URL?ref=CODE` weiter
- Verkäufe manuell erfassen oder automatisch melden lassen:
  ```bash
  curl -X POST https://deine-app/api/public/sale -H 'content-type: application/json' \
    -d '{"key":"API-SCHLÜSSEL","ref":"anna","amount":499,"customer_email":"kunde@example.de"}'
  ```
  (API-Schlüssel unter Einstellungen erzeugen; `ref` liest deine Website aus der URL.)
- Dashboard mit Zeitraum, Einnahmen, Konversion, Kunden, Top-Affiliates, geschuldet/ausgezahlt;
  Provisionen freigeben, auszahlen, stornieren; CSV-Export

### 🔗 Trigger-Links
Kurzlinks `https://deine-app/l/slug` mit Klickzählung – für Flyer, QR-Codes, E-Mails, Bios.

### 🔍 Website-Check (Prospecting)
Firmenname + Website eingeben → nach wenigen Sekunden ein Bericht mit über 30 Prüfungen:

- **Unternehmensangaben**: Chat-Widget, klickbare & nachrichtenfähige Telefonnummer, E-Mail,
  Impressum, Datenschutz, Schema.org-Daten
- **Technologie-Stack**: Google Analytics, Tag Manager, Google-Ads-Conversion, Meta-Pixel, Cookie-Consent
- **SEO-Grundlagen**: Titel, Meta-Beschreibung, H1, Viewport, Alt-Texte, Canonical, Open Graph,
  robots.txt, Sitemap
- **Performance & Sicherheit**: HTTPS, Weiterleitung, Antwortzeit, Seitengröße, HSTS,
  gemischte Inhalte, Google-PageSpeed (mobil)
- **Google-Unternehmensprofil & Bewertungen** (mit `GOOGLE_PLACES_API_KEY`)

Der Bericht trägt dein Branding und einen „Jetzt Kontakt aufnehmen“-Button. Über
„Bericht teilen“ kopierst du den öffentlichen Link `https://deine-app/bericht/…` für den
Interessenten; über „Öffnen / PDF“ druckst du ihn als PDF. „Als Lead anlegen“ legt Kontakt und
Lead in der Pipeline an.

## Betrieb auf einem Server

Die App braucht einen Server, auf dem Node.js dauerhaft läuft (z. B. ein IONOS-VPS, Hetzner,
Render, Railway oder Fly.io) – ein reines Webspace-Paket reicht **nicht**, weil der Planer im
Hintergrund laufen muss. Beispiel mit systemd:

```ini
# /etc/systemd/system/cockpit.service
[Service]
WorkingDirectory=/opt/webhafen-cockpit
Environment=ADMIN_PASSWORD=… HTTPS=1 PORT=3000
ExecStart=/usr/bin/npm start
Restart=always
[Install]
WantedBy=multi-user.target
```

Davor einen Reverse-Proxy mit HTTPS (z. B. Caddy: `cockpit.web-hafen.de { reverse_proxy localhost:3000 }`)
und unter Einstellungen die „Öffentliche Adresse“ eintragen.

## Was (noch) fehlt

- **Anzeigen-Manager** (Google/Meta/LinkedIn/TikTok Ads): braucht von jeder Plattform eine
  freigeschaltete Entwickler-App bzw. einen Google-Ads-Developer-Token – nicht enthalten.
- Direkte Social-Anbindung ohne Webhook für Meta, LinkedIn, TikTok, YouTube (gleicher Grund).
- Mehrere Benutzer / Kunden-Konten (aktuell ein gemeinsamer Login).
- E-Mail-Versand, Countdown-Timer, Marken-Boards.
