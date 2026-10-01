# Ready Check auf IONOS hochladen

1. Im IONOS-Kundenbereich unter **Hosting → Webspace** den Webspace-Explorer öffnen
   (oder per SFTP verbinden, z. B. mit FileZilla; die Zugangsdaten stehen unter Hosting → SFTP & SSH).
2. Einen Ordner anlegen, z. B. `ready-check`.
3. **Den gesamten Inhalt** dieses Ordners hineinladen, auch den Unterordner `fonts`
   und die versteckte Datei `.htaccess`.
4. Aufrufen: `https://ihre-domain.de/ready-check/` (SSL muss für die Domain aktiv sein).

## Auf dem Handy installieren
- **iPhone (Safari):** Seite öffnen → Teilen-Symbol → „Zum Home-Bildschirm“.
- **Android (Chrome):** Seite öffnen → Menü ⋮ → „App installieren“ / „Zum Startbildschirm hinzufügen“.

Danach startet die App vom Home-Bildschirm im Vollbild, ohne Browserleiste, und funktioniert auch offline.

## Später etwas ändern
Geänderte Dateien hochladen und in `sw.js` die Zeile `VERSION = "ready-check-v1"`
hochzählen (v2, v3 …), damit die Handys die neue Version laden.

Hinweis: Die Haken werden nur auf dem Handy gespeichert, auf dem sie gesetzt werden.
Die App vom Home-Bildschirm hat einen eigenen Speicher, getrennt vom normalen Safari.
