# 深鲸 Key 保险箱（dsh-key-vault）

**什么时候用**：用户要在本机管理**自己**的 API Key（多个平台、设默认、轮换、删除）。用户会说「把我的 key 存起来」「我有好几个平台的 key」「默认用哪个」。

## 怎么用

```bash
<cli 路径> --set <provider> --key <key> [--label 说明]
<cli 路径> --set <provider> --key -        # 从 stdin 读，避免 shell 历史留痕
<cli 路径> --list
<cli 路径> --default <provider>
<cli 路径> --remove <provider>
```

## 规则（硬性）

- **只存用户自己的 Key**：我们不提供、不代持、不代理任何凭据；费用与额度由用户在对应平台承担；
- 存储 `~/.deepwhale/key-vault.json`，权限 0600；
- `--list` **只回掩码**（例如 `sk-a…f3d2`），任何输出都不回显完整 Key；
- 不联网、不上传；删除即从本机移除。
