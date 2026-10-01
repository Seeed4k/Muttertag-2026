# Prompt: „Ready Check“-App für ein Kind erstellen

**So benutzen:** Den Block unten komplett kopieren, die Felder in `[ECKIGEN KLAMMERN]` ausfüllen und in einen neuen Chat mit Claude einfügen. Das Foto für den Avatar direkt mit anhängen.

**Tipp:** Wenn du zusätzlich die Datei `ready-check.html` von Leni anhängst und schreibst „Nimm diese Datei als Vorlage“, wird das Ergebnis am zuverlässigsten gleich schön.

---

```
Erstelle mir eine tägliche Abhak-App für ein Kind als einzelne HTML-Datei
(plus installierbare Web-App-Version, siehe unten). Bitte auf Deutsch.

## Das Kind
- Name: [NAME, z. B. Mia]
- Alter: [ALTER, z. B. 11]
- Avatar: [das angehängte Foto (Haustier/Kind/Lieblingsmotiv) – bitte als runden Ausschnitt verwenden | oder: Anfangsbuchstabe]
- Steht auf: [z. B. TikTok, Snapchat, YouTube | Gaming | Pferde | Fußball | K-Pop …]
- Lieblingsfarben (optional): [z. B. Pink/Türkis wie TikTok | Grün/Schwarz | egal]

## Aufgaben
Schul-Aufgaben nur an den Abenden vor einem Schultag: [Sonntag bis Donnerstag].
Alltags-Aufgaben: [jeden Tag].

1. Schultasche ([So–Do]):
   - Tasche ausgeräumt & aufgeräumt (ggf. auswischen)
   - Für morgen nach Stundenplan gepackt
   - Sportsachen? (Morgen Sport?)
   - Brotdose (und Trinkflasche) gespült
   - Material gecheckt: fehlt was / muss was besorgt werden?
     → mit Notizfeld, das gespeichert wird und in der Status-Nachricht auftaucht
2. Outfit ([So–Do]):
   - Kleidung für morgen bereitgelegt (komplett, inkl. Socken & Unterwäsche)
3. Zimmer ([jeden Tag]):
   - Boden frei
   - Wäsche weggeräumt (Schrank oder Wäschekorb)
   - Geschirr in die Küche gebracht
   - Treppe frei
   - Staubsaugen nur an: [Mittwoch + Samstag]
[Weitere Aufgaben oder Änderungen hier ergänzen / streichen]

## Status an die Eltern
- Button „Status an [Papa | Mama | Mama & Papa]“
- Öffnet WhatsApp direkt im Chat mit: [HANDYNUMMER im Format 49170…, ohne + und ohne 0 vorne]
  (falls leer: WhatsApp ohne festen Empfänger öffnen)
- Zusätzlich „Kopieren“-Button
- Nachricht: Name, Wochentag + Datum, x/y erledigt mit %, je Bereich erledigt/offen
  inkl. der offenen Aufgaben, Notiz „Muss besorgt werden“, aktueller Streak

## Look & Feel (jugendgerecht, Social-Media-Stil, wirklich „exklusiv“)
- Dunkles Design mit langsam fließendem Aurora-Hintergrund (Farbwolken) + feiner Körnung
- Milchglas-Karten mit feinem, leuchtendem Rand
- Oben: Logo mit schimmerndem Farbverlauf, Chips für 🔥 Streak und ⚡ XP
- Begrüßung „Hey [NAME] 👋“ mit rundem Avatar im sich drehenden Farbring (Bild selbst dreht sich nicht)
- Wochentage So–Sa als Story-Kreise (wie Instagram/Snapchat), Ring füllt sich mit dem Fortschritt,
  „HEUTE“-Badge, antippen wechselt den Tag
- Großer, leuchtender Fortschrittsring (wie Smartwatch) mit % in der Mitte und einem
  motivierenden Spruch daneben
- Aufgabenbereiche als „Posts“ mit Icon, Titel und Handle (z. B. @ready.for.school, @fit.check,
  @clean.room.era); fertige Bereiche bekommen einen drehenden Regenbogenrand + „DONE“-Sticker
- Beim Abhaken: Funken-Effekt am Häkchen, „+10 XP“ fliegt hoch, ab und zu ein Toast mit
  Jugendsprache (z. B. „Slay! 💅“, „W! 🏆“, „Läuft bei dir 😎“, „Sheesh! 🥶“, „Aura +1000 ✨“)
  [Sprüche an Alter/Geschmack anpassen]
- Alles erledigt: Konfetti + Pop-up „Ready für morgen!“ + 50 Bonus-XP
- Freitag/Samstag: Hinweis „Wochenende-Modus 😎“, nur Zimmer zählt
- Tab „Woche“: Level-Karte im Holo-Sammelkarten-Look (Level alle 300 XP: Rookie, Rising Star,
  Pro, Influencer, Legend, GOAT), Abzeichen (erster Tag, 3/7/14 Tage Streak, Level 3, 1000 XP),
  Wochenübersicht mit Balken, Zurücksetzen mit Bestätigung in der Seite (kein confirm())
- Schwebende, runde Tab-Leiste unten (Heute / Woche / Drucken)
- Schriften: Unbounded (Überschriften) + Figtree (Text)
- Respektiert „Bewegung reduzieren“, gut lesbar, Handy zuerst (ab 360 px Breite)

## Speichern
- Alles automatisch sofort im Browser speichern (localStorage, je Datum): Haken, Notizen,
  Name, Bonus-XP. Lesen/Schreiben in try/catch.

## Druckversion (Schwarz-Weiß-optimiert)
- Tab „Drucken“ mit Vorschau + Button „Wochenplan drucken“
- Beim Drucken nur der Wochenplan: A4 hoch, eine Seite, rein schwarz-weiß, keine Flächenfarben
- Tabelle Aufgaben × So–Sa, leere Kästchen zum Abhaken, „—“ an freien Tagen,
  Bereichsüberschriften mit „Sonntag bis Donnerstag“ / „jeden Tag“, kleine Hinweise unter den Aufgaben
- Zeile „Alles geschafft? Stern ausmalen!“ mit ☆ je Tag
- Unten Felder „Fehlt was / muss besorgt werden“ und „Wochen-Bilanz ___ von 7 Sternen / Belohnung bei 7/7“
- Name bereits eingetragen, „Woche vom ___ bis ___“ zum Ausfüllen

## Installierbare App für eigenes Hosting (z. B. IONOS)
Bitte zusätzlich ein ZIP-Paket für meinen Webspace erstellen:
- index.html, manifest.webmanifest (standalone, dunkle Theme-Farbe), Service Worker für Offline-Nutzung
  (Network-first, Versionsnummer zum Hochzählen), App-Icons 192/512 + apple-touch-icon 180
  (leuchtender Farbring mit weißem Häkchen auf dunklem Grund), Favicon
- Schriften selbst gehostet (DSGVO, keine Google-Server)
- iOS-Meta-Tags für Vollbild, Inhalte frei von Notch/Home-Leiste
- .htaccess (MIME-Typen, HTTPS-Weiterleitung, noindex), robots.txt (alles sperren)
- Kurze deutsche ANLEITUNG.md: Hochladen, Subdomain + SSL, auf dem Handy installieren

Teste die App kurz (Abhaken, Status-Text, Druckvorschau auf einer A4-Seite) bevor du sie mir gibst.
```
