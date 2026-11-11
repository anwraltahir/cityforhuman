/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
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
