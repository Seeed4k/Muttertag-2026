import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function openDb(file) {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;`);
  db.exec(`
  CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT, phone TEXT, company TEXT,
    tags TEXT DEFAULT '', notes TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now','localtime')));

  CREATE TABLE IF NOT EXISTS pipelines (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL, use_opp_probability INTEGER DEFAULT 0,
    color_mode TEXT DEFAULT 'none', created_at TEXT DEFAULT (datetime('now','localtime')));
  CREATE TABLE IF NOT EXISTS stages (
    id INTEGER PRIMARY KEY, pipeline_id INTEGER NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
    name TEXT NOT NULL, probability INTEGER DEFAULT 0, position INTEGER DEFAULT 0, color TEXT DEFAULT '#3b82f6');
  CREATE TABLE IF NOT EXISTS opportunities (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
    pipeline_id INTEGER NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
    stage_id INTEGER REFERENCES stages(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'open', value REAL DEFAULT 0, probability INTEGER,
    owner TEXT DEFAULT '', followers TEXT DEFAULT '', company TEXT DEFAULT '', source TEXT DEFAULT '',
    close_date TEXT, tags TEXT DEFAULT '', notes TEXT DEFAULT '',
    slip_count INTEGER DEFAULT 0, slip_days INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now','localtime')), updated_at TEXT, closed_at TEXT);

  CREATE TABLE IF NOT EXISTS social_accounts (
    id INTEGER PRIMARY KEY, platform TEXT NOT NULL, name TEXT NOT NULL,
    webhook_url TEXT DEFAULT '', handle TEXT DEFAULT '', secret TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now','localtime')));
  CREATE TABLE IF NOT EXISTS social_categories (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL, days TEXT DEFAULT '[]', time TEXT DEFAULT '09:00',
    account_ids TEXT DEFAULT '[]', active INTEGER DEFAULT 1, last_run TEXT);
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY, content TEXT NOT NULL, media_url TEXT DEFAULT '', link TEXT DEFAULT '',
    account_ids TEXT DEFAULT '[]', scheduled_at TEXT, status TEXT DEFAULT 'draft',
    category_id INTEGER REFERENCES social_categories(id) ON DELETE SET NULL,
    recurrence TEXT, last_run TEXT, source TEXT DEFAULT 'manuell', last_error TEXT,
    publish_count INTEGER DEFAULT 0, published_at TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime')));
  CREATE TABLE IF NOT EXISTS post_log (
    id INTEGER PRIMARY KEY, post_id INTEGER, account_id INTEGER, ok INTEGER, message TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime')));
  CREATE TABLE IF NOT EXISTS rss_feeds (
    id INTEGER PRIMARY KEY, name TEXT, url TEXT NOT NULL, account_ids TEXT DEFAULT '[]',
    mode TEXT DEFAULT 'draft', template TEXT DEFAULT '{title}\n\n{link}', seen TEXT DEFAULT '[]',
    last_checked TEXT, last_error TEXT);

  CREATE TABLE IF NOT EXISTS aff_campaigns (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL, target_type TEXT DEFAULT 'extern', target_url TEXT NOT NULL,
    commission_type TEXT DEFAULT 'percent', commission_value REAL DEFAULT 10, cookie_days INTEGER DEFAULT 30,
    active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now','localtime')));
  CREATE TABLE IF NOT EXISTS affiliates (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT DEFAULT '', code TEXT UNIQUE NOT NULL,
    campaign_id INTEGER REFERENCES aff_campaigns(id) ON DELETE CASCADE, active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now','localtime')));
  CREATE TABLE IF NOT EXISTS aff_clicks (
    id INTEGER PRIMARY KEY, affiliate_id INTEGER REFERENCES affiliates(id) ON DELETE CASCADE,
    referer TEXT, created_at TEXT DEFAULT (datetime('now','localtime')));
  CREATE TABLE IF NOT EXISTS aff_sales (
    id INTEGER PRIMARY KEY, affiliate_id INTEGER REFERENCES affiliates(id) ON DELETE CASCADE,
    campaign_id INTEGER, customer_name TEXT DEFAULT '', customer_email TEXT DEFAULT '',
    amount REAL DEFAULT 0, commission REAL DEFAULT 0, status TEXT DEFAULT 'pending', note TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now','localtime')), paid_at TEXT);

  CREATE TABLE IF NOT EXISTS trigger_links (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, target_url TEXT NOT NULL,
    tag TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now','localtime')));
  CREATE TABLE IF NOT EXISTS link_clicks (
    id INTEGER PRIMARY KEY, link_id INTEGER REFERENCES trigger_links(id) ON DELETE CASCADE,
    referer TEXT, created_at TEXT DEFAULT (datetime('now','localtime')));

  CREATE TABLE IF NOT EXISTS audits (
    id INTEGER PRIMARY KEY, token TEXT UNIQUE NOT NULL, business_name TEXT NOT NULL, url TEXT NOT NULL,
    industry TEXT DEFAULT '', phone TEXT DEFAULT '', address TEXT DEFAULT '', score INTEGER,
    result TEXT, contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
    created_at TEXT DEFAULT (datetime('now','localtime')));
  `);

  // Erststart: Standard-Pipeline anlegen
  const count = db.prepare('SELECT COUNT(*) AS n FROM pipelines').get().n;
  if (!count) {
    const p = db.prepare('INSERT INTO pipelines (name) VALUES (?)').run('Marketing-Pipeline');
    const ins = db.prepare('INSERT INTO stages (pipeline_id, name, probability, position) VALUES (?,?,?,?)');
    [['Neuer Lead', 10], ['Kontaktiert', 20], ['Qualifiziert', 40], ['Angebot gesendet', 60], ['Verhandlung', 80], ['Abgeschlossen', 100]]
      .forEach(([n, pr], i) => ins.run(p.lastInsertRowid, n, pr, i));
  }
  return db;
}

export function getSettings(db) {
  const out = {};
  for (const r of db.prepare('SELECT key, value FROM settings').all()) out[r.key] = r.value;
  return out;
}
export function setSettings(db, obj) {
  const st = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  for (const [k, v] of Object.entries(obj)) st.run(k, v == null ? '' : String(v));
}
