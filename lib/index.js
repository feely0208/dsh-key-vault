import { createPlugin, pkgRootFrom } from '@deepwhale-cn/dsh-guard-core/plugin';
import { registerKeyVaultApi } from './api.js';

const base = createPlugin({
  name: 'key-vault',
  pkgRoot: pkgRootFrom(import.meta.url),
  skillFile: 'skill/key-vault.md',
  binFile: 'bin/cli.mjs',
  description: '深鲸 Key 保险箱：本机保存你自带的多个 API Key（只显示掩码、0600 权限、不上传）',
  whenToUse: '当用户要在本机管理自己的模型/服务 API Key 时使用：多个 provider、设默认、删除、轮换。存储在本机 ~/.deepwhale/key-vault.json（0600），列表只回掩码，绝不回显完整 Key。典型说法：「把我的 key 存起来」「我有好几个平台的 key 要管」「默认用哪个 key」。',
});

export const name = base.name;
export const inject = [...base.inject, 'webServer'];

export function apply(ctx) {
  base.apply(ctx);
  try {
    if (ctx.webServer && typeof ctx.webServer.register === 'function') {
      registerKeyVaultApi(ctx);
      ctx.logger?.info?.('[key-vault] 已挂面板出口 /dsh-key-vault/api');
    }
  } catch (e) { ctx.logger?.warn?.('[key-vault] 面板出口注册失败: ' + (e?.message || e)); }
}
