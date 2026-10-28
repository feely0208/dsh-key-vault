# 深鲸 Key 保险箱（@deepwhale-cn/dsh-key-vault）

本机管理**你自己**的多个 API Key：只显示掩码、0600 权限、不上传任何地方。

> 我们不提供、不代持、不代理任何凭据；费用与额度由你在对应平台自行承担。

## 安装

```bash
dsh plugin --profile web add @deepwhale-cn/dsh-key-vault
```

## 面板

侧栏「深鲸 Key 保险箱」→ 填 provider + key → 保存（之后只显示掩码）；可设默认、删除。

## 命令

```bash
dsh-key-vault --set deepseek --key sk-xxxx --label 个人
dsh-key-vault --set openai --key -          # 从 stdin 读，避免 shell 历史留痕
dsh-key-vault --list                        # 只显示掩码
dsh-key-vault --default deepseek
dsh-key-vault --remove openai
```

存储：`~/.deepwhale/key-vault.json`（0600）。删除即从本机移除。
