#!/bin/bash
# 深鲸 Key 保险箱 · 回归（保存/掩码/列表/默认/删除/权限/不回显）
set -uo pipefail
export PATH="/usr/local/bin:$PATH"
cd "$(dirname "$0")/.."
export DSH_KEYVAULT_HOME="$(mktemp -d)"
PASS=0; FAIL=0
ok(){ echo "  ✅ $1"; PASS=$((PASS+1)); }
bad(){ echo "  ❌ $1"; FAIL=$((FAIL+1)); }
echo ""; echo "  深鲸 Key 保险箱 · 回归"

OUT=$(node bin/cli.mjs --set deepseek --key sk-test-abcdef123456 --label 测试 2>&1)
echo "$OUT" | grep -q "已保存 deepseek" && ok "保存成功" || bad "保存失败：$OUT"
echo "$OUT" | grep -q "sk-t…3456" && ok "输出是掩码" || bad "掩码不对：$OUT"
echo "$OUT" | grep -q "sk-test-abcdef123456" && bad "完整 key 被回显！" || ok "完整 key 未回显"

L=$(node bin/cli.mjs --list 2>&1)
echo "$L" | grep -q "sk-t…3456" && ok "列表显示掩码" || bad "列表掩码缺失：$L"
echo "$L" | grep -q "sk-test-abcdef123456" && bad "列表回显完整 key！" || ok "列表未回显完整 key"

node bin/cli.mjs --set openai --key sk-openai-99999999 >/dev/null
D1=$(node bin/cli.mjs --default openai 2>&1)
echo "$D1" | grep -q "默认 provider：openai" && ok "切换默认" || bad "切换默认失败：$D1"

PERM=$(stat -f "%Lp" "$DSH_KEYVAULT_HOME/key-vault.json" 2>/dev/null || stat -c "%a" "$DSH_KEYVAULT_HOME/key-vault.json")
[ "$PERM" = "600" ] && ok "文件权限 0600" || bad "权限是 $PERM，期望 600"

R=$(node bin/cli.mjs --remove deepseek 2>&1)
echo "$R" | grep -q "已删除 deepseek" && ok "删除成功" || bad "删除失败：$R"
L2=$(node bin/cli.mjs --list 2>&1)
echo "$L2" | grep -q "deepseek" && bad "删除后仍存在" || ok "删除后不再出现"

S=$(node bin/cli.mjs --set bad --key short 2>&1)
echo "$S" | grep -q "太短" && ok "拒绝过短 key" || bad "未拒绝过短 key：$S"

echo "  ────────────────────────────────────────"
echo "  通过 $PASS · 失败 $FAIL"
rm -rf "$DSH_KEYVAULT_HOME"
[ "$FAIL" -eq 0 ]
