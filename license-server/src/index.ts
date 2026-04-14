import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import checkout from './routes/checkout';
import webhooks from './routes/webhooks';
import fulfill from './routes/fulfill';
import trial from './routes/trial';
import activate from './routes/activate';
import refresh from './routes/refresh';
import portal from './routes/portal';

const app = new Hono<{ Bindings: Env }>();

// CORS: allow the marketing site and the desktop app to hit the API.
// The desktop app sends no Origin header, so it is unaffected.
app.use('/api/*', cors({
  origin: (origin, c) => {
    const allow = new Set([c.env.APP_URL, 'https://psygil.com', 'https://www.psygil.com']);
    return origin && allow.has(origin) ? origin : allow.values().next().value ?? '';
  },
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Stripe-Signature'],
}));

app.get('/', (c) => c.text('psygil-license'));
app.get('/health', (c) => c.json({ ok: true, env: c.env.ENVIRONMENT }));

app.route('/api/checkout', checkout);
app.route('/api/fulfill', fulfill);
app.route('/api/webhooks/stripe', webhooks);
app.route('/api/trial/start', trial);
app.route('/api/license/activate', activate);
app.route('/api/license/refresh', refresh);
app.route('/api/portal', portal);

app.onError((err, c) => {
  console.error('unhandled', err);
  return c.json({ error: 'internal_error' }, 500);
});

app.notFound((c) => c.json({ error: 'not_found' }, 404));

export default app;
