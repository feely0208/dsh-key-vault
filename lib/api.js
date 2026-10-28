/** 深鲸 Key 保险箱 · 宿主 HTTP 出口（面板用；列表只回掩码） */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { 列表, 删除, 设Key, 设默认 } from './vault.mjs';

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROUTE = '/dsh-key-vault';
const VERSION = (() => { try { return JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8')).version || ''; } catch { return ''; } })();

function 回(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(body) });
  res.end(body);
}
async function 读体(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const t = Buffer.concat(chunks).toString('utf8');
  if (!t) return {};
  try { return JSON.parse(t); } catch { return {}; }
}

export function registerKeyVaultApi(ctx) {
  const handler = async (req, res) => {
    try {
      const u = new URL(req.url || '/', 'http://127.0.0.1');
      const p = u.pathname;
      if (p === `${ROUTE}/api/info` && req.method === 'GET') return 回(res, 200, { ok: true, version: VERSION });
      if (p === `${ROUTE}/api/list` && req.method === 'GET') return 回(res, 200, { ok: true, providers: 列表() });
      if (p === `${ROUTE}/api/set` && req.method === 'POST') {
        const b = await 读体(req);
        return 回(res, 200, 设Key({ provider: String(b.provider || ''), key: String(b.key || ''), label: String(b.label || '') }));
      }
      if (p === `${ROUTE}/api/remove` && req.method === 'POST') {
        const b = await 读体(req);
        return 回(res, 200, 删除({ provider: String(b.provider || '') }));
      }
      if (p === `${ROUTE}/api/default` && req.method === 'POST') {
        const b = await 读体(req);
        return 回(res, 200, 设默认({ provider: String(b.provider || '') }));
      }
      return 回(res, 404, { ok: false, error: 'not found' });
    } catch (e) { return 回(res, 500, { ok: false, error: e?.message || String(e) }); }
  };
  ctx.webServer.register({ kind: 'prefix', path: ROUTE, handler });
}
