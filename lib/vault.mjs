/**
 * 深鲸 Key 保险箱 · 内核
 *
 * 原则（用户 2026-10-28 定）：**只用用户自己的 Key，我们不提供任何凭据**。
 *   · 存储在本机 `~/.deepwhale/key-vault.json`，权限 0600；
 *   · 列表只显示掩码（sk-…abcd），**永不回显完整 Key**；
 *   · 支持多 provider、设默认、删除、轮换；不联网、不上传。
 */
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const 掩码 = (k) => {
  const s = String(k || '');
  if (s.length <= 8) return '****';
  return `${s.slice(0, 4)}…${s.slice(-4)}`;
};

function 家() {
  return process.env.DSH_KEYVAULT_HOME || join(homedir(), '.deepwhale');
}
function 文件() {
  return join(家(), 'key-vault.json');
}

export function 读库() {
  try {
    const j = JSON.parse(readFileSync(文件(), 'utf8'));
    if (j && typeof j === 'object' && j.providers && typeof j.providers === 'object') return j;
  } catch { /* 没有或损坏 */ }
  return { version: 1, providers: {}, default: '' };
}

function 写库(j) {
  mkdirSync(家(), { recursive: true });
  const f = 文件();
  const tmp = `${f}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(j, null, 2) + '\n', { mode: 0o600 });
  renameSync(tmp, f);
  try { chmodSync(f, 0o600); } catch { /* 某些文件系统不支持 */ }
}

/** 设置/更新一个 provider 的 Key */
export function 设Key({ provider, key, label = '' }) {
  const p = String(provider || '').trim();
  const k = String(key || '').trim();
  if (!p) return { ok: false, error: '缺少 provider（例如 deepseek / openai / anthropic）' };
  if (!k) return { ok: false, error: '缺少 key' };
  if (k.length < 8) return { ok: false, error: 'key 太短（至少 8 位），像是填错了' };
  const j = 读库();
  const 已存在 = Boolean(j.providers[p]);
  j.providers[p] = { key: k, label: String(label || ''), updatedAt: new Date().toISOString(), createdAt: j.providers[p]?.createdAt || new Date().toISOString() };
  if (!j.default) j.default = p;
  写库(j);
  return { ok: true, provider: p, updated: 已存在, 掩码: 掩码(k), default: j.default };
}

/** 列表：只回掩码，不回完整 key */
export function 列表() {
  const j = 读库();
  return Object.entries(j.providers).map(([provider, v]) => ({
    provider,
    label: v.label || '',
    mask: 掩码(v.key),
    updatedAt: v.updatedAt || '',
    default: j.default === provider,
  }));
}

export function 删除({ provider }) {
  const p = String(provider || '').trim();
  const j = 读库();
  if (!j.providers[p]) return { ok: false, error: `没有这个 provider：${p}` };
  delete j.providers[p];
  if (j.default === p) j.default = Object.keys(j.providers)[0] || '';
  写库(j);
  return { ok: true, provider: p, default: j.default };
}

export function 设默认({ provider }) {
  const p = String(provider || '').trim();
  const j = 读库();
  if (!j.providers[p]) return { ok: false, error: `没有这个 provider：${p}` };
  j.default = p;
  写库(j);
  return { ok: true, default: p };
}

/** 取出真实 key（只给宿主内部用；CLI 不提供这个出口） */
export function 取Key({ provider }) {
  const j = 读库();
  const p = String(provider || j.default);
  return j.providers[p]?.key || '';
}
