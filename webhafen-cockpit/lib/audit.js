// Website-/Marketing-Audit für Interessenten (Prospecting)
const UA = 'Mozilla/5.0 (compatible; WebhafenAudit/1.0; +https://web-hafen.de)';

const has = (html, ...res) => res.some((r) => r.test(html));

const CHAT_WIDGETS = [
  ['Tawk.to', /embed\.tawk\.to/i], ['Crisp', /client\.crisp\.chat/i], ['Intercom', /widget\.intercom\.io|intercomSettings/i],
  ['Tidio', /code\.tidio\.co/i], ['HubSpot Chat', /js\.hs-scripts\.com|hubspot.*conversations/i], ['Zendesk', /static\.zdassets\.com/i],
  ['LiveChat', /cdn\.livechatinc\.com/i], ['Userlike', /userlike/i], ['Smartsupp', /smartsuppchat/i], ['Drift', /js\.driftt\.com/i],
  ['Chatwoot', /chatwoot/i], ['LeadConnector', /leadconnectorhq|msgsndr/i], ['WhatsApp-Button', /wa\.me\/|api\.whatsapp\.com\/send/i],
  ['Facebook Messenger', /connect\.facebook\.net\/[^"']*\/sdk\/xfbml\.customerchat/i], ['Brevo Chat', /conversations-widget\.brevo\.com|sibautomation/i],
];
const CMS = [
  ['WordPress', /wp-content|wp-includes/i], ['Wix', /static\.wixstatic\.com|wix\.com/i], ['Jimdo', /jimdo/i],
  ['Shopify', /cdn\.shopify\.com/i], ['Squarespace', /squarespace/i], ['Webflow', /webflow/i], ['TYPO3', /typo3/i],
  ['Joomla', /\/media\/jui\/|joomla/i], ['IONOS MyWebsite', /ionos|mywebsite-editor|website-editor\.net/i], ['Contao', /contao/i],
  ['Drupal', /drupal/i], ['Shopware', /shopware/i], ['Astro', /astro-island|_astro\//i], ['Next.js', /__NEXT_DATA__|_next\/static/i],
  ['LeadConnector', /leadconnectorhq|msgsndr/i], ['Strato Sitebuilder', /strato/i],
];
const CONSENT = [/cookiebot/i, /usercentrics/i, /borlabs/i, /complianz/i, /cookieyes/i, /onetrust/i, /consentmanager/i, /klaro/i, /ccm19/i, /real-cookie-banner/i, /cookie-?consent/i, /cookie-?banner/i];

async function fetchTimed(url, opts = {}) {
  const t0 = performance.now();
  const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': UA, accept: 'text/html,*/*' }, ...opts });
  const body = await r.text();
  return { r, body, ms: Math.round(performance.now() - t0) };
}

const check = (label, ok, detail, tip = '') => ({ label, ok, detail, tip });

function scoreOf(checks) {
  const rel = checks.filter((c) => c.ok !== null);
  return rel.length ? Math.round((rel.filter((c) => c.ok).length / rel.length) * 100) : null;
}

export function normalizeUrl(u) {
  u = String(u || '').trim();
  if (!u) throw new Error('Bitte eine Website-Adresse angeben');
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  const parsed = new URL(u);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Nur http/https erlaubt');
  // Schutz vor Abfragen interner Adressen (SSRF)
  if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[?::1\]?$)/i.test(parsed.hostname)) throw new Error('Interne Adressen sind nicht erlaubt');
  return parsed.toString();
}

export function analyzeHtml(html, { url, headers = {}, ms = 0, httpRedirectsToHttps = null, robots = null, sitemap = null, phone = '' }) {
  const lower = html.toLowerCase();
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.trim() || '';
  const metaDesc = (html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i) || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i) || [])[1] || '';
  const h1 = (html.match(/<h1[\s>]/gi) || []).length;
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  const imgsNoAlt = imgs.filter((i) => !/\balt=["'][^"']+["']/i.test(i)).length;
  const scripts = (html.match(/<script\b/gi) || []).length;
  const sizeKb = Math.round(Buffer.byteLength(html) / 1024);
  const isHttps = url.startsWith('https://');
  const chat = CHAT_WIDGETS.filter(([, r]) => r.test(html)).map(([n]) => n);
  const cms = CMS.filter(([, r]) => r.test(html)).map(([n]) => n);
  const generator = (html.match(/<meta[^>]+name=["']generator["'][^>]*content=["']([^"']+)["']/i) || [])[1];
  const telLinks = (html.match(/href=["']tel:/gi) || []).length;
  const digits = (s) => s.replace(/\D/g, '').replace(/^0049|^49/, '0');
  const phoneOnPage = phone ? digits(html).includes(digits(phone).slice(-7)) : null;
  const mailVisible = /mailto:|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(html);
  const localBusiness = /"@type"\s*:\s*"(LocalBusiness|Organization|[A-Za-z]*(Store|School|Business|Service|Restaurant|Dentist|Physician|Attorney))"/i.test(html);
  const mobileNumber = phone ? /^(\+?49|0)1[5-7]/.test(phone.replace(/[\s/()-]/g, '')) : null;

  const categories = [
    {
      key: 'business', name: 'Unternehmensangaben',
      description: 'Wichtige Kontakt- und Pflichtangaben, über die Kunden Ihr Unternehmen erreichen und ihm vertrauen.',
      checks: [
        check('Chat-Widget auf der Website', chat.length > 0, chat.length ? `Gefunden: ${chat.join(', ')}` : 'Auf der Website ist kein Chat-Widget aktiv.', 'Ein Chat- oder WhatsApp-Button senkt die Hürde für Anfragen deutlich – viele Besucher schreiben lieber, als anzurufen.'),
        check('Klickbare Telefonnummer', telLinks > 0, telLinks ? `${telLinks} tel:-Link(s) gefunden` : 'Keine klickbare Telefonnummer gefunden.', 'Auf dem Smartphone sollte ein Tipp auf die Nummer direkt den Anruf starten (tel:-Link).'),
        check('Nachrichtenfähige Nummer (Mobil/WhatsApp)', mobileNumber === null ? null : mobileNumber || /wa\.me|whatsapp/i.test(html), mobileNumber === null ? 'Keine Telefonnummer angegeben' : mobileNumber ? 'Mobilnummer – per SMS/WhatsApp erreichbar' : 'Festnetznummer – keine Nachrichten per SMS/WhatsApp möglich.', 'Die meisten Menschen schreiben Unternehmen lieber eine Nachricht. WhatsApp Business oder eine SMS-fähige Nummer anbieten.'),
        check('Telefonnummer auf der Website', phoneOnPage, phoneOnPage === null ? 'Keine Vergleichsnummer angegeben' : phoneOnPage ? 'Die Telefonnummer steht auf der Startseite.' : 'Die angegebene Telefonnummer steht nicht auf der Startseite.', 'Name, Adresse und Telefonnummer sollten überall identisch sein (NAP-Konsistenz) – wichtig für lokales SEO.'),
        check('E-Mail-Adresse sichtbar', mailVisible, mailVisible ? 'E-Mail-Adresse oder mailto-Link gefunden' : 'Keine E-Mail-Adresse auf der Startseite.'),
        check('Impressum verlinkt', /impressum|imprint/i.test(lower), /impressum|imprint/i.test(lower) ? 'Impressum-Link gefunden' : 'Kein Impressum-Link auf der Startseite gefunden.', 'In Deutschland Pflicht (§ 5 DDG). Fehlt es, drohen Abmahnungen.'),
        check('Datenschutzerklärung verlinkt', /datenschutz|privacy/i.test(lower), /datenschutz|privacy/i.test(lower) ? 'Datenschutz-Link gefunden' : 'Kein Datenschutz-Link gefunden.', 'Pflicht nach DSGVO.'),
        check('Strukturierte Unternehmensdaten (Schema.org)', localBusiness, localBusiness ? 'LocalBusiness/Organization-Markup vorhanden' : 'Keine strukturierten Unternehmensdaten gefunden.', 'Schema.org-Markup hilft Google, Öffnungszeiten, Adresse und Bewertungen korrekt anzuzeigen.'),
      ],
    },
    {
      key: 'tech', name: 'Technologie-Stack',
      description: 'Grundlegende Werkzeuge, um Marketing-Erfolg zu messen und Zielgruppen gezielt anzusprechen.',
      checks: [
        check('Google Analytics', has(html, /gtag\(['"]config['"],\s*['"]G-/i, /googletagmanager\.com\/gtag\/js\?id=G-/i, /google-analytics\.com\/(analytics|ga)\.js/i), null, 'Ohne Analytics fehlen Informationen über Besucher, Quellen und das Verhalten auf der Seite.'),
        check('Google Tag Manager', has(html, /googletagmanager\.com\/gtm\.js/i, /GTM-[A-Z0-9]{4,}/), null, 'Der Tag Manager bündelt alle Tracking-Codes und macht Änderungen ohne Entwickler möglich.'),
        check('Google-Ads-Conversion-Tracking', has(html, /AW-\d{6,}/, /googleadservices\.com/i), null, 'Ohne Conversion-Tracking lässt sich der Erfolg von Google-Ads-Kampagnen nicht messen.'),
        check('Meta-Pixel', has(html, /connect\.facebook\.net\/[^"']*\/fbevents\.js/i, /fbq\(['"]init['"]/i), null, 'Das Meta-Pixel ist Voraussetzung, um Facebook-/Instagram-Werbung zu optimieren und Retargeting zu nutzen.'),
        check('Cookie-Einwilligung (Consent-Tool)', has(html, ...CONSENT), null, 'Wer Tracking einsetzt, braucht in der EU eine Einwilligungs-Abfrage (TTDSG/DSGVO).'),
      ].map((c) => ({ ...c, detail: c.detail ?? (c.ok ? 'Auf der Website erkannt.' : 'Auf der Website nicht erkannt.') })),
    },
    {
      key: 'seo', name: 'SEO-Grundlagen',
      description: 'Technische Grundlagen, damit Google die Seite versteht und gut darstellt.',
      checks: [
        check('Seitentitel', title.length >= 10 && title.length <= 65, title ? `„${title.slice(0, 80)}“ (${title.length} Zeichen)` : 'Kein Seitentitel vorhanden.', 'Ideal sind 30–65 Zeichen mit Leistung und Ort, z. B. „Fahrschule in Haren (Ems) – Neehoff“.'),
        check('Meta-Beschreibung', metaDesc.length >= 50 && metaDesc.length <= 170, metaDesc ? `${metaDesc.length} Zeichen` : 'Keine Meta-Beschreibung vorhanden.', 'Die Beschreibung erscheint in den Google-Ergebnissen – 120–160 Zeichen mit Handlungsaufforderung.'),
        check('Genau eine H1-Überschrift', h1 === 1, `${h1} H1-Überschrift(en) gefunden`),
        check('Mobil-optimiert (Viewport)', /<meta[^>]+name=["']viewport["']/i.test(html), null, 'Ohne Viewport-Angabe wird die Seite auf Smartphones verkleinert dargestellt.'),
        check('Bilder mit Alternativtext', imgs.length === 0 ? null : imgsNoAlt / imgs.length <= 0.2, `${imgs.length - imgsNoAlt} von ${imgs.length} Bildern haben einen Alt-Text`),
        check('Sprachangabe (lang)', /<html[^>]+lang=/i.test(html), null),
        check('Canonical-Tag', /<link[^>]+rel=["']canonical["']/i.test(html), null),
        check('Social-Vorschau (Open Graph)', /property=["']og:(title|image)["']/i.test(html), null, 'Open-Graph-Tags sorgen für eine schöne Vorschau, wenn die Seite auf Facebook, WhatsApp oder LinkedIn geteilt wird.'),
        check('robots.txt', robots, robots === null ? 'Nicht geprüft' : robots ? 'Vorhanden' : 'Nicht gefunden'),
        check('XML-Sitemap', sitemap, sitemap === null ? 'Nicht geprüft' : sitemap ? 'Vorhanden' : 'Nicht gefunden', 'Eine Sitemap hilft Google, alle Unterseiten zu finden.'),
      ].map((c) => ({ ...c, detail: c.detail ?? (c.ok ? 'Vorhanden' : 'Fehlt') })),
    },
    {
      key: 'performance', name: 'Website-Performance & Sicherheit',
      description: 'Ladezeit, Verschlüsselung und technischer Zustand der Website.',
      checks: [
        check('HTTPS-Verschlüsselung', isHttps, isHttps ? 'Die Seite wird verschlüsselt ausgeliefert.' : 'Die Seite ist nicht verschlüsselt.', 'Browser warnen bei unverschlüsselten Seiten – das kostet Vertrauen und Rankings.'),
        check('Weiterleitung von http auf https', httpRedirectsToHttps, httpRedirectsToHttps === null ? 'Nicht geprüft' : httpRedirectsToHttps ? 'http:// leitet auf https:// weiter' : 'http:// leitet nicht auf https:// weiter'),
        check('Server-Antwortzeit', ms < 1500, `${ms} ms bis die Startseite geladen war`, 'Unter 0,8 s ist gut, über 1,5 s wirkt die Seite träge.'),
        check('Seitengröße (HTML)', sizeKb < 300, `${sizeKb} KB HTML`),
        check('Anzahl Skripte', scripts <= 25, `${scripts} Skript-Einbindungen`, 'Viele Skripte verlangsamen den Seitenaufbau, besonders auf dem Smartphone.'),
        check('Sicherheits-Header (HSTS)', !!headers['strict-transport-security'], headers['strict-transport-security'] ? 'HSTS aktiv' : 'Kein HSTS-Header gesetzt'),
        check('Kein gemischter Inhalt', isHttps ? !/(src|href)=["']http:\/\/(?!localhost)[^"']+\.(js|css|png|jpe?g|gif|webp|svg)/i.test(html) : null, null),
      ].map((c) => ({ ...c, detail: c.detail ?? (c.ok ? 'In Ordnung' : 'Unverschlüsselte Ressourcen auf einer HTTPS-Seite gefunden') })),
    },
  ];
  return { categories, meta: { title, metaDesc, cms: generator ? [generator, ...cms] : cms, chat, sizeKb, ms, scripts } };
}

async function pageSpeed(url, key) {
  const q = new URLSearchParams({ url, strategy: 'mobile', category: 'performance' });
  if (key) q.set('key', key);
  const r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${q}`, { signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`PageSpeed ${r.status}`);
  const j = await r.json();
  const a = j.lighthouseResult?.audits || {};
  return {
    score: Math.round((j.lighthouseResult?.categories?.performance?.score ?? 0) * 100),
    lcp: a['largest-contentful-paint']?.displayValue, cls: a['cumulative-layout-shift']?.displayValue,
    tbt: a['total-blocking-time']?.displayValue, fcp: a['first-contentful-paint']?.displayValue,
  };
}

async function googlePlace(name, address, key) {
  const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST', signal: AbortSignal.timeout(15000),
    headers: { 'content-type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'places.displayName,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber,places.regularOpeningHours,places.formattedAddress,places.photos,places.businessStatus,places.googleMapsUri' },
    body: JSON.stringify({ textQuery: `${name} ${address}`.trim(), languageCode: 'de' }),
  });
  if (!r.ok) throw new Error(`Places ${r.status}`);
  return (await r.json()).places?.[0] || null;
}

export async function runAudit({ url, business_name, phone = '', address = '' }, env = {}) {
  url = normalizeUrl(url);
  const main = await fetchTimed(url);
  const finalUrl = main.r.url || url;
  const headers = Object.fromEntries(main.r.headers);
  const origin = new URL(finalUrl).origin;
  const probe = async (u) => { try { const r = await fetch(u, { signal: AbortSignal.timeout(8000), headers: { 'user-agent': UA } }); return r.ok; } catch { return false; } };
  const [robots, sitemap, httpRedirectsToHttps] = await Promise.all([
    probe(origin + '/robots.txt'),
    probe(origin + '/sitemap.xml').then((ok) => ok || probe(origin + '/sitemap_index.xml')),
    (async () => {
      try { const r = await fetch(finalUrl.replace(/^https:/, 'http:'), { redirect: 'manual', signal: AbortSignal.timeout(8000), headers: { 'user-agent': UA } });
        return r.status >= 300 && r.status < 400 && /^https:/i.test(r.headers.get('location') || ''); } catch { return null; }
    })(),
  ]);
  const res = analyzeHtml(main.body, { url: finalUrl, headers, ms: main.ms, httpRedirectsToHttps, robots, sitemap, phone });
  const notes = [];

  // Optional: Google PageSpeed (ohne Schlüssel mit geringem Kontingent)
  try {
    const ps = await pageSpeed(finalUrl, env.PAGESPEED_API_KEY);
    res.meta.pagespeed = ps;
    res.categories.find((c) => c.key === 'performance').checks.unshift(
      check('PageSpeed-Wert (mobil)', ps.score >= 70, `${ps.score}/100 · LCP ${ps.lcp || '–'} · CLS ${ps.cls || '–'} · TBT ${ps.tbt || '–'}`, 'Google bewertet langsame mobile Seiten schlechter. Bilder komprimieren, Skripte reduzieren, Caching aktivieren.'));
  } catch (e) { notes.push(`PageSpeed nicht verfügbar: ${e.message}`); }

  // Optional: Google-Unternehmensprofil & Bewertungen über Places API
  if (env.GOOGLE_PLACES_API_KEY) {
    try {
      const pl = await googlePlace(business_name, address, env.GOOGLE_PLACES_API_KEY);
      res.meta.place = pl;
      const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
      res.categories.push({
        key: 'gbp', name: 'Google-Unternehmensprofil & Bewertungen',
        description: 'Wie Ihr Unternehmen in Google Maps und der lokalen Suche erscheint.',
        checks: pl ? [
          check('Profil gefunden', true, pl.displayName?.text + ' · ' + (pl.formattedAddress || '')),
          check('Website im Profil hinterlegt', !!pl.websiteUri && hostOf(pl.websiteUri) === hostOf(finalUrl), pl.websiteUri || 'Keine Website hinterlegt'),
          check('Telefonnummer im Profil', !!pl.nationalPhoneNumber, pl.nationalPhoneNumber || 'Keine Telefonnummer'),
          check('Öffnungszeiten gepflegt', !!pl.regularOpeningHours, pl.regularOpeningHours ? 'Vorhanden' : 'Fehlen'),
          check('Fotos vorhanden (mind. 5)', (pl.photos?.length || 0) >= 5, `${pl.photos?.length || 0} Fotos`),
          check('Durchschnittsbewertung ≥ 4,5', (pl.rating || 0) >= 4.5, pl.rating ? `${String(pl.rating).replace('.', ',')} Sterne` : 'Keine Bewertungen'),
          check('Mindestens 25 Bewertungen', (pl.userRatingCount || 0) >= 25, `${pl.userRatingCount || 0} Bewertungen`, 'Regelmäßig um Bewertungen bitten – z. B. per QR-Code oder Link nach dem Auftrag.'),
        ] : [check('Profil gefunden', false, 'Kein Google-Unternehmensprofil gefunden.', 'Ein gepflegtes Unternehmensprofil ist der wichtigste Faktor für lokale Sichtbarkeit.')],
      });
    } catch (e) { notes.push(`Google-Profil nicht abrufbar: ${e.message}`); }
  } else notes.push('Google-Unternehmensprofil nicht geprüft (GOOGLE_PLACES_API_KEY fehlt).');

  for (const c of res.categories) c.score = scoreOf(c.checks);
  const scored = res.categories.filter((c) => c.score !== null);
  const score = Math.round(scored.reduce((a, c) => a + c.score, 0) / (scored.length || 1));
  return { url: finalUrl, score, categories: res.categories, meta: res.meta, notes, checked_at: new Date().toISOString() };
}
