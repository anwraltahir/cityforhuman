/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import express, { NextFunction, Request, Response } from 'express';
import { Engine, ActionError, StoredUser } from './server/engine';
import { findCountry, normalizeNational, phoneError } from './src/data/countries';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Basic API Health
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      platform: 'مدن الإنسان – City for Human',
      version: '1.0.0',
      domain: 'cityforhuman.com',
      timestamp: new Date().toISOString(),
    });
  });

  // ---- Data engine: single source of truth for all community data (./data/db.json)
  const DATA_DIR = path.resolve(__dirname, 'data');
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const engine = new Engine(DATA_DIR);

  // ---- User sessions: "<userId>.<expiry>.<hmac>", stateless so they survive restarts.
  // The signature covers a fingerprint of the user's password, so changing it ends old sessions.
  const SESSION_DAYS = 30;
  const sign = (v: string) => crypto.createHmac('sha256', process.env.SESSION_SECRET || '').update(v).digest('hex');
  const pwPrint = (u: StoredUser) =>
    crypto.createHash('sha256').update(u.passwordHash || `admin:${process.env.ADMIN_PASSWORD || ''}`).digest('hex').slice(0, 16);
  const issueToken = (u: StoredUser) => {
    const exp = String(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
    return `${u.id}.${exp}.${sign(`${u.id}.${exp}.${pwPrint(u)}`)}`;
  };
  const sessionUser = (req: Request): StoredUser | null => {
    const token = String(req.headers.authorization || '').replace(/^Bearer /, '');
    const [id, exp, mac] = token.split('.');
    if (!id || !exp || !mac || mac.length !== 64 || Number(exp) < Date.now()) return null;
    const u = engine.user(id);
    if (!u || u.status === 'suspended') return null;
    const good = sign(`${id}.${exp}.${pwPrint(u)}`);
    return crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(good)) ? u : null;
  };
  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const u = sessionUser(req);
    if (!u || (u.role !== 'admin' && u.role !== 'moderator')) {
      return res.status(401).json({ ok: false, error: 'انتهت جلسة الإدارة، سجّل الخروج ثم ادخل مجدداً' });
    }
    next();
  };

  // Simple per-IP rate limiter
  const limiter = (max: number, windowMs: number) => {
    const hits = new Map<string, { count: number; until: number }>();
    return (req: Request) => {
      const ip = String(req.headers['x-real-ip'] || req.ip);
      const t = Date.now();
      const h = hits.get(ip);
      if (!h || h.until < t) {
        hits.set(ip, { count: 1, until: t + windowMs });
        return true;
      }
      h.count++;
      return h.count <= max;
    };
  };
  const loginLimit = limiter(10, 15 * 60 * 1000);
  const registerLimit = limiter(5, 60 * 60 * 1000);
  const actionLimit = limiter(120, 60 * 1000);

  const sendError = (res: Response, err: unknown) => {
    if (err instanceof ActionError) return res.status(err.status).json({ ok: false, error: err.message });
    console.error(err);
    return res.status(500).json({ ok: false, error: 'حدث خطأ غير متوقع في الخادم' });
  };

  // Full state for the viewer (public data + their own private data)
  app.get('/api/state', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true, state: engine.stateFor(sessionUser(req)) });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    if (!loginLimit(req)) return res.status(429).json({ ok: false, error: 'محاولات كثيرة، حاول بعد 15 دقيقة' });
    try {
      const u = engine.login(req.body?.identifier, req.body?.password, process.env.ADMIN_PASSWORD || '');
      res.json({ ok: true, token: issueToken(u), state: engine.stateFor(u) });
    } catch (err) {
      sendError(res, err);
    }
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    if (!registerLimit(req)) return res.status(429).json({ ok: false, error: 'محاولات كثيرة، حاول لاحقاً' });
    try {
      const u = engine.register(req.body || {});
      res.json({ ok: true, token: issueToken(u), state: engine.stateFor(u) });
    } catch (err) {
      sendError(res, err);
    }
  });

  // Every change goes through here: { type, args } runs as the signed-in user
  app.post('/api/action', (req: Request, res: Response) => {
    if (!actionLimit(req)) return res.status(429).json({ ok: false, error: 'طلبات كثيرة، انتظر قليلاً' });
    const actor = sessionUser(req);
    try {
      const result = engine.run(String(req.body?.type || ''), req.body?.args || {}, actor);
      // A password change invalidates the old token, so hand back a fresh one
      const token = req.body?.type === 'changePassword' && actor ? issueToken(actor) : undefined;
      res.json({ ok: true, result, token, state: engine.stateFor(actor) });
    } catch (err) {
      sendError(res, err);
    }
  });

  // ---- Book covers: uploaded files live in ./uploads (outside dist, survives rebuilds)
  const UPLOAD_DIR = path.resolve(__dirname, 'uploads');
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const COVER_DEFAULTS: Record<string, string> = {
    front: 'book_cover_front.jpeg',
    official: 'book_cover_official.jpeg',
  };
  const COVER_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  const findCover = (slot: string) =>
    Object.values(COVER_TYPES)
      .map((ext) => path.join(UPLOAD_DIR, `cover-${slot}.${ext}`))
      .find((f) => fs.existsSync(f));

  app.get('/cover/:slot', (req: Request, res: Response) => {
    const slot = req.params.slot;
    if (!COVER_DEFAULTS[slot]) return res.status(404).end();
    const file =
      findCover(slot) ||
      path.resolve(__dirname, isProduction ? 'dist' : 'public', 'images', COVER_DEFAULTS[slot]);
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(file);
  });

  app.post('/api/admin/cover/:slot', requireAdmin, (req: Request, res: Response) => {
    const slot = req.params.slot;
    if (!COVER_DEFAULTS[slot]) return res.status(404).json({ ok: false });
    const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(req.body?.dataUrl || ''));
    if (!m) return res.status(400).json({ ok: false, error: 'الصيغة غير مدعومة، استخدم JPG أو PNG أو WEBP' });
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length > 7 * 1024 * 1024) return res.status(413).json({ ok: false, error: 'حجم الصورة أكبر من 7 ميجابايت' });
    const old = findCover(slot);
    if (old) fs.unlinkSync(old);
    fs.writeFileSync(path.join(UPLOAD_DIR, `cover-${slot}.${COVER_TYPES[m[1]]}`), buf);
    res.json({ ok: true });
  });

  app.delete('/api/admin/cover/:slot', requireAdmin, (req: Request, res: Response) => {
    const old = COVER_DEFAULTS[req.params.slot] && findCover(req.params.slot);
    if (old) fs.unlinkSync(old);
    res.json({ ok: true });
  });

  // ---- "Register your interest" (pre-launch mailing list), stored in ./data (gitignored)
  const INTEREST_FILE = path.join(DATA_DIR, 'interest.json');
  type Interest = { id: string; name: string; email: string; phone: string; country: string; createdAt: string };
  const readInterest = (): Interest[] => {
    try { return JSON.parse(fs.readFileSync(INTEREST_FILE, 'utf8')); } catch { return []; }
  };
  const writeInterest = (list: Interest[]) => {
    const tmp = `${INTEREST_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(list, null, 1));
    fs.renameSync(tmp, INTEREST_FILE);
  };
  const interestHits = new Map<string, { count: number; until: number }>();

  app.post('/api/interest', (req: Request, res: Response) => {
    const ip = String(req.headers['x-real-ip'] || req.ip);
    const now = Date.now();
    const hit = interestHits.get(ip);
    if (hit && hit.until > now && hit.count >= 10) {
      return res.status(429).json({ ok: false, error: 'محاولات كثيرة، حاول لاحقاً' });
    }
    interestHits.set(ip, { count: (hit && hit.until > now ? hit.count : 0) + 1, until: hit && hit.until > now ? hit.until : now + 60 * 60 * 1000 });

    const clean = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
    const name = clean(req.body?.name, 100);
    const email = clean(req.body?.email, 150).toLowerCase();
    // All fields are required; the phone is checked against the chosen country's dial code and length
    const countryInfo = findCountry(clean(req.body?.countryCode, 2).toUpperCase());
    const national = normalizeNational(clean(req.body?.phone, 30));
    if (!name) return res.status(400).json({ ok: false, error: 'يرجى كتابة الاسم' });
    if (!email) return res.status(400).json({ ok: false, error: 'يرجى كتابة البريد الإلكتروني' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ ok: false, error: 'البريد الإلكتروني غير صحيح' });
    const phoneProblem = phoneError(countryInfo, national);
    if (phoneProblem) return res.status(400).json({ ok: false, error: phoneProblem });
    const phone = `+${countryInfo!.dial}${national}`;
    const country = countryInfo!.name;

    const list = readInterest();
    const dup = list.some((x) => (email && x.email === email) || (phone && x.phone === phone));
    if (!dup) {
      list.push({ id: crypto.randomUUID(), name, email, phone, country, createdAt: new Date().toISOString() });
      writeInterest(list);
    }
    res.json({ ok: true, already: dup });
  });

  app.get('/api/admin/interest', requireAdmin, (_req: Request, res: Response) => {
    res.json({ ok: true, items: readInterest().reverse() });
  });

  app.get('/api/admin/interest.csv', requireAdmin, (_req: Request, res: Response) => {
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [['الاسم', 'البريد الإلكتروني', 'الجوال', 'الدولة', 'تاريخ التسجيل']]
      .concat(readInterest().map((x) => [x.name, x.email, x.phone, x.country, x.createdAt.slice(0, 10)]));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="interested-readers.csv"');
    // BOM so Excel opens Arabic correctly
    res.send('﻿' + rows.map((r) => r.map(esc).join(',')).join('\r\n'));
  });

  app.delete('/api/admin/interest/:id', requireAdmin, (req: Request, res: Response) => {
    writeInterest(readInterest().filter((x) => x.id !== req.params.id));
    res.json({ ok: true });
  });

  // REST API status endpoints for the community platform
  app.get('/api/info', (_req: Request, res: Response) => {
    res.json({
      book: 'مدن الإنسان',
      author: 'عثمان الطيب',
      chaptersCount: 10,
      description: 'كيف غيرت السيارات المدن؟ وماذا نفعل لتعود المدينة للإنسان؟',
      officialSite: 'https://cityforhuman.com',
    });
  });

  // Serve static generated assets or Vite in development
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist'), {
      setHeaders: (res, file) => {
        // HTML must be revalidated so phones pick up new deploys; hashed assets can cache forever
        if (file.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
        else if (file.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      },
    }));
    // SPA fallback. For shareable pages (discussion / article / chapter) the page's own
    // title and description are written into the meta tags, because link previews
    // (WhatsApp, Facebook, X) read the HTML without running JavaScript.
    const INDEX_FILE = path.resolve(__dirname, 'dist', 'index.html');
    const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const clip = (v: string, n: number) => {
      const t = v.replace(/\s+/g, ' ').trim();
      return t.length > n ? `${t.slice(0, n - 1)}…` : t;
    };
    const pageMeta = (urlPath: string): { title: string; description: string; image?: string } | null => {
      const [, kind, rawId] = urlPath.split('/');
      const id = rawId ? decodeURIComponent(rawId) : '';
      const db = engine.db;
      if (kind === 'discussions' && id) {
        const d = db.discussions.find((x) => x.id === id);
        return d ? { title: d.title, description: d.content, image: d.imageUrl } : null;
      }
      if (kind === 'articles' && id) {
        const a = db.articles.find((x) => x.id === id && x.status === 'approved');
        return a ? { title: a.title, description: a.excerpt || a.content, image: a.coverImage } : null;
      }
      if (kind === 'chapters' && /^\d+$/.test(id)) {
        const c = db.chapters.find((x) => x.id === Number(id));
        return c ? { title: c.title, description: c.subtitle ? `${c.subtitle} — ${c.description}` : c.description } : null;
      }
      return null;
    };

    app.get('*', (req: Request, res: Response) => {
      res.setHeader('Cache-Control', 'no-cache');
      const meta = pageMeta(req.path);
      if (!meta) return res.sendFile(INDEX_FILE);

      const site = 'مدن الإنسان – City for Human';
      const url = `https://cityforhuman.com${req.path}`;
      const title = esc(`${clip(meta.title, 90)} | ${site}`);
      const description = esc(clip(meta.description, 200));
      const image = meta.image
        ? esc(meta.image.startsWith('/') ? `https://cityforhuman.com${meta.image}` : meta.image)
        : null;

      let html = fs.readFileSync(INDEX_FILE, 'utf8');
      const setTag = (re: RegExp, value: string) => {
        html = html.replace(re, (_m, before, _old, after) => `${before}${value}${after}`);
      };
      html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
      setTag(/(<meta name="description" content=")([^"]*)("[^>]*>)/, description);
      setTag(/(<link rel="canonical" href=")([^"]*)("[^>]*>)/, url);
      setTag(/(<meta property="og:title" content=")([^"]*)("[^>]*>)/, title);
      setTag(/(<meta property="og:description" content=")([^"]*)("[^>]*>)/, description);
      setTag(/(<meta property="og:url" content=")([^"]*)("[^>]*>)/, url);
      setTag(/(<meta property="og:type" content=")([^"]*)("[^>]*>)/, 'article');
      setTag(/(<meta name="twitter:title" content=")([^"]*)("[^>]*>)/, title);
      setTag(/(<meta name="twitter:description" content=")([^"]*)("[^>]*>)/, description);
      if (image) {
        setTag(/(<meta property="og:image" content=")([^"]*)("[^>]*>)/, image);
        setTag(/(<meta property="og:image:secure_url" content=")([^"]*)("[^>]*>)/, image);
        setTag(/(<meta name="twitter:image" content=")([^"]*)("[^>]*>)/, image);
      }
      res.type('html').send(html);
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[City for Human] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
