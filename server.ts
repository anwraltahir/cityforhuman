/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import express, { NextFunction, Request, Response } from 'express';
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

  // ---- Admin session tokens: "<expiry>.<hmac>", stateless so they survive restarts.
  // Changing ADMIN_PASSWORD or SESSION_SECRET invalidates every issued token.
  const tokenKey = () => `${process.env.SESSION_SECRET || ''}:${process.env.ADMIN_PASSWORD || ''}`;
  const sign = (v: string) => crypto.createHmac('sha256', tokenKey()).update(v).digest('hex');
  const issueAdminToken = () => {
    const exp = String(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return `${exp}.${sign(exp)}`;
  };
  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const token = String(req.headers.authorization || '').replace(/^Bearer /, '');
    const [exp, mac] = token.split('.');
    const valid =
      !!process.env.ADMIN_PASSWORD && !!exp && !!mac && Number(exp) > Date.now() &&
      mac.length === 64 && crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(sign(exp)));
    if (!valid) return res.status(401).json({ ok: false, error: 'انتهت جلسة الإدارة، سجّل الخروج ثم ادخل مجدداً' });
    next();
  };

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

  // Admin password check (password lives in .env as ADMIN_PASSWORD, never in the client bundle)
  const failedAttempts = new Map<string, { count: number; until: number }>();
  app.post('/api/admin/verify', (req: Request, res: Response) => {
    const ip = String(req.headers['x-real-ip'] || req.ip);
    const now = Date.now();
    const rec = failedAttempts.get(ip);
    if (rec && rec.count >= 5 && rec.until > now) {
      return res.status(429).json({ ok: false, error: 'محاولات كثيرة، حاول بعد 15 دقيقة' });
    }
    const expected = process.env.ADMIN_PASSWORD || '';
    const given = String(req.body?.password ?? '');
    const a = crypto.createHash('sha256').update(given).digest();
    const b = crypto.createHash('sha256').update(expected).digest();
    if (expected && crypto.timingSafeEqual(a, b)) {
      failedAttempts.delete(ip);
      return res.json({ ok: true, token: issueAdminToken() });
    }
    const count = (rec && rec.until > now ? rec.count : 0) + 1;
    failedAttempts.set(ip, { count, until: now + 15 * 60 * 1000 });
    return res.status(401).json({ ok: false, error: 'كلمة المرور غير صحيحة' });
  });

  // ---- "Register your interest" (pre-launch mailing list), stored in ./data (gitignored)
  const DATA_DIR = path.resolve(__dirname, 'data');
  fs.mkdirSync(DATA_DIR, { recursive: true });
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
    const phone = clean(req.body?.phone, 30).replace(/[^\d+]/g, '');
    const country = clean(req.body?.country, 60);
    if (!name) return res.status(400).json({ ok: false, error: 'يرجى كتابة الاسم' });
    if (!email && !phone) return res.status(400).json({ ok: false, error: 'يرجى كتابة البريد الإلكتروني أو رقم الجوال' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false, error: 'البريد الإلكتروني غير صحيح' });
    if (phone && !/^\+?\d{7,15}$/.test(phone)) return res.status(400).json({ ok: false, error: 'رقم الجوال غير صحيح' });

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
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[City for Human] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
