import { esc } from './util.js';

const tone = (s) => (s == null ? 'muted' : s >= 80 ? 'good' : s >= 50 ? 'warn' : 'bad');
const verdict = (s) => (s >= 80 ? 'Sehr gut aufgestellt' : s >= 50 ? 'Raum für Verbesserungen' : 'Dringender Handlungsbedarf');

function ring(score, size = 132) {
  const r = 52; const c = 2 * Math.PI * r; const off = c * (1 - (score || 0) / 100);
  return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="${score} Prozent">
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--track)" stroke-width="10"/>
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--${tone(score)})" stroke-width="10" stroke-linecap="round"
      stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 60 60)"/>
    <text x="60" y="58" text-anchor="middle" font-size="26" font-weight="700" fill="currentColor">${score}%</text>
    <text x="60" y="78" text-anchor="middle" font-size="10" fill="var(--sub)">Gesamtwertung</text></svg>`;
}

export function renderReport(a, s) {
  const r = a.result || {}; const cats = r.categories || [];
  const agency = s.agency_name || 'Ihre Agentur';
  const cta = s.cta_url || (s.agency_email ? `mailto:${s.agency_email}?subject=${encodeURIComponent('Audit-Bericht ' + a.business_name)}` : '#');
  const bad = cats.filter((c) => c.score != null && c.score < 50); const good = cats.filter((c) => c.score != null && c.score >= 50);
  const bar = (c) => `<a class="bar" href="#${c.key}"><span>${esc(c.name)}</span><b class="${tone(c.score)}">${c.score}%</b><i><em class="${tone(c.score)}" style="width:${c.score}%"></em></i></a>`;
  const date = new Date(r.checked_at || a.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Online-Check: ${esc(a.business_name)}</title><meta name="robots" content="noindex">
<style>
:root{--bg:#f4f6fb;--card:#fff;--text:#0f172a;--sub:#64748b;--line:#e2e8f0;--track:#e5e7eb;--good:#16a34a;--warn:#d97706;--bad:#dc2626;--muted:#94a3b8;--accent:${esc(s.brand_color || '#2563eb')}}
@media (prefers-color-scheme:dark){:root{--bg:#0b1120;--card:#111a2e;--text:#e2e8f0;--sub:#94a3b8;--line:#1e293b;--track:#1e293b}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.wrap{max-width:1040px;margin:0 auto;padding:24px 16px 64px}.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px;margin-bottom:18px}
.agency{display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between}.agency h2{margin:0;font-size:18px}.agency small{color:var(--sub)}
.btn{display:inline-block;background:var(--accent);color:#fff;text-decoration:none;padding:10px 18px;border-radius:9px;font-weight:600}
h1{font-size:26px;margin:0 0 4px}.sub{color:var(--sub)}.hero{display:grid;grid-template-columns:auto 1fr;gap:24px;align-items:center}
.verdict{font-size:20px;font-weight:700;margin:0 0 6px}.good{color:var(--good)}.warn{color:var(--warn)}.bad{color:var(--bad)}.muted{color:var(--muted)}
.bars{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;margin-top:10px}.bar{display:grid;grid-template-columns:1fr auto;gap:4px 10px;padding:12px 14px;border:1px solid var(--line);border-radius:10px;color:inherit;text-decoration:none}
.bar i{grid-column:1/-1;height:6px;background:var(--track);border-radius:9px;overflow:hidden}.bar em{display:block;height:100%;background:currentColor}
h3.grp{font-size:13px;text-transform:uppercase;letter-spacing:.05em;margin:18px 0 4px}
.cat h2{margin:0;font-size:19px;display:flex;gap:10px;align-items:center}.pill{font-size:12px;border:1px solid currentColor;border-radius:99px;padding:1px 9px}
.checks{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;margin-top:14px}.chk{border:1px solid var(--line);border-radius:10px;padding:14px;position:relative}
.chk b{display:block;padding-right:28px}.chk p{margin:6px 0 0;color:var(--sub);font-size:14px}.chk .tip{color:var(--text);font-size:13.5px;border-left:3px solid var(--accent);padding-left:9px;margin-top:8px}
.ico{position:absolute;top:12px;right:12px;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:13px;font-weight:700}
.ico.ok{background:var(--good)}.ico.no{background:var(--bad)}.ico.na{background:var(--muted)}
.facts{display:flex;flex-wrap:wrap;gap:6px 22px;color:var(--sub);font-size:14px;margin-top:10px}.foot{text-align:center;color:var(--sub);font-size:13px}
@media (max-width:640px){.hero{grid-template-columns:1fr;justify-items:center;text-align:center}}
@media print{body{background:#fff}.card{break-inside:avoid;border-color:#ddd}.btn{display:none}}
</style></head><body><div class="wrap">
<div class="card agency"><div><h2>${esc(agency)}</h2><small>${[s.agency_website, s.agency_email, s.agency_phone].filter(Boolean).map(esc).join(' · ')}</small></div>
<div><span class="sub" style="margin-right:12px">Fragen zu Ihrem Ergebnis?</span><a class="btn" href="${esc(cta)}">Jetzt Kontakt aufnehmen</a></div></div>

<div class="card"><h1>${esc(a.business_name)}</h1><div class="sub">Online-Check vom ${date}${a.industry ? ' · ' + esc(a.industry) : ''}</div>
<div class="facts"><span>🌐 <a href="${esc(r.url || a.url)}" style="color:inherit">${esc((r.url || a.url).replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a></span>${a.address ? `<span>📍 ${esc(a.address)}</span>` : ''}${a.phone ? `<span>📞 ${esc(a.phone)}</span>` : ''}${r.meta?.cms?.length ? `<span>🧩 ${esc(r.meta.cms.join(', '))}</span>` : ''}</div></div>

<div class="card"><p class="sub" style="margin-top:0">Rund 8 von 10 Kunden informieren sich online, bevor sie ein Unternehmen kontaktieren. Fehlende oder unvollständige Angaben kosten Vertrauen und Anfragen. Dieser Bericht zeigt, wo Ihr Unternehmen gut dasteht – und wo es Potenzial gibt.</p>
<div class="hero">${ring(a.score)}<div><p class="verdict ${tone(a.score)}">${verdict(a.score)}</p>
<div class="sub">Der Wert fasst ${cats.length} Bereiche mit ${cats.reduce((n, c) => n + c.checks.length, 0)} Einzelprüfungen zusammen.${bad.length ? ` Das größte Potenzial liegt bei: ${bad.map((c) => esc(c.name)).join(', ')}.` : ''}</div></div></div>
${bad.length ? `<h3 class="grp bad">Benötigt Aufmerksamkeit</h3><div class="bars">${bad.map(bar).join('')}</div>` : ''}
${good.length ? `<h3 class="grp good">Läuft gut</h3><div class="bars">${good.map(bar).join('')}</div>` : ''}</div>

${cats.map((c) => `<div class="card cat" id="${c.key}"><h2>${esc(c.name)} <span class="pill ${tone(c.score)}">${c.score ?? '–'}%</span></h2><p class="sub" style="margin:6px 0 0">${esc(c.description)}</p>
<div class="checks">${c.checks.map((k) => `<div class="chk"><span class="ico ${k.ok === null ? 'na' : k.ok ? 'ok' : 'no'}">${k.ok === null ? '–' : k.ok ? '✓' : '✕'}</span><b>${esc(k.label)}</b><p>${esc(k.detail)}</p>${!k.ok && k.ok !== null && k.tip ? `<p class="tip">${esc(k.tip)}</p>` : ''}</div>`).join('')}</div></div>`).join('')}

<div class="card agency"><div><h2>Wir helfen Ihnen, die Punkte zu beheben</h2><small>${esc(agency)} kümmert sich um Website, Tracking, Google-Profil und mehr.</small></div><a class="btn" href="${esc(cta)}">Kostenloses Erstgespräch</a></div>
<p class="foot">Automatisch erstellt am ${date}. Alle Prüfungen beziehen sich auf die öffentlich erreichbare Startseite.</p>
</div></body></html>`;
}
