#!/usr/bin/env node
/**
 * 深鲸 Key 保险箱 CLI（只存用户自己的 Key，绝不回显完整 Key）
 *
 *   dsh-key-vault --set <provider> --key <key> [--label 说明]
 *   dsh-key-vault --list
 *   dsh-key-vault --remove <provider>
 *   dsh-key-vault --default <provider>
 *   dsh-key-vault --demo
 */
import { readFileSync } from 'node:fs';
import { 列表, 删除, 设Key, 设默认 } from '../lib/vault.mjs';

const args = process.argv.slice(2);
const get = (name, def = '') => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : def;
};
const has = (n) => args.includes(n);

function help() {
  console.log(`dsh-key-vault —— 深鲸 Key 保险箱（只存你自己的 Key）

用法：
  dsh-key-vault --set <provider> --key <key> [--label 说明]
  dsh-key-vault --list
  dsh-key-vault --remove <provider>
  dsh-key-vault --default <provider>
  dsh-key-vault --demo

说明：
  · 存储位置 ~/.deepwhale/key-vault.json（0600）；
  · 列表只显示掩码（如 sk-a…f3d2），**不会回显完整 Key**；
  · 全部本机完成，不上传、不联网。费用与额度由你自己在对应平台承担。`);
}

if (!args.length || has('--help') || has('-h')) { help(); process.exit(0); }

if (has('--demo')) {
  process.env.DSH_KEYVAULT_HOME = process.env.DSH_KEYVAULT_HOME || '/tmp/dwh-keyvault-demo';
  const a = 设Key({ provider: 'demo', key: 'sk-demo-1234567890', label: '演示用' });
  console.log('设置：', JSON.stringify(a));
  console.log('列表：', JSON.stringify(列表(), null, 1));
  console.log('删除：', JSON.stringify(删除({ provider: 'demo' })));
  console.log('列表：', JSON.stringify(列表()));
  process.exit(0);
}

if (has('--list')) {
  const l = 列表();
  if (!l.length) { console.log('（空）还没有保存任何 Key。用 --set <provider> --key <key> 添加。'); process.exit(0); }
  for (const x of l) console.log(`${x.default ? '* ' : '  '}${x.provider.padEnd(14)} ${x.mask}${x.label ? '  ' + x.label : ''}`);
  process.exit(0);
}

if (has('--remove')) {
  const r = 删除({ provider: get('--remove') || args[args.indexOf('--remove') + 1] });
  console.log(r.ok ? `已删除 ${r.provider}（默认：${r.default || '无'}）` : `❌ ${r.error}`);
  process.exit(r.ok ? 0 : 1);
}

if (has('--default')) {
  const r = 设默认({ provider: args[args.indexOf('--default') + 1] || '' });
  console.log(r.ok ? `默认 provider：${r.default}` : `❌ ${r.error}`);
  process.exit(r.ok ? 0 : 1);
}

if (has('--set')) {
  // --key 支持直接给，或 `--key -` 从 stdin 读（避免 shell history 留痕）
  let key = get('--key');
  if (key === '-' ) {
    try { key = readFileSync(0, 'utf8').trim(); } catch { key = ''; }
  }
  const provider = get('--set') || args[args.indexOf('--set') + 1];
  const r = 设Key({ provider, key, label: get('--label') });
  if (!r.ok) { console.error('❌', r.error); process.exit(1); }
  console.log(`${r.updated ? '已更新' : '已保存'} ${r.provider}（${r.掩码}${r.default === r.provider ? '，默认' : ''}）`);
  process.exit(0);
}

console.error('未知参数'); help(); process.exit(2);
