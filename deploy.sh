#!/bin/bash
# 打包 maia-resurrection 并部署到线上（hdwzgzs.cn）
# 流程：pnpm build → 打包 dist → 备份旧包 → 复制 tar.gz + package.json → ansible 部署
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_PACKAGES="/home/comardom/deploy_packages"
ALMA_DIR="/home/comardom/AnsibleProjects/alma"
TARBALL="$DEPLOY_PACKAGES/hdwzgzs.cn.tar.gz"
PACKAGE_JSON="$DEPLOY_PACKAGES/hdwzgzs.cn.package.json"

echo "==> 1/5 构建"
cd "$PROJECT_DIR"
pnpm font:subset:studio
pnpm build

echo "==> 2/5 备份旧包"
if [ -f "$TARBALL" ]; then
    cp "$TARBALL" "$TARBALL.bak-$(date +%Y%m%d%H%M%S)"
fi

echo "==> 3/5 打包 dist"
tar -czf "$TARBALL" -C "$PROJECT_DIR/dist" client server

echo "==> 4/5 复制 package.json"
cp "$PROJECT_DIR/package.json" "$PACKAGE_JSON"

echo "==> 校验包内容"
contents="$(tar -tzf "$TARBALL")"
for f in "server/entry.mjs" "client/_astro" "client/studio-history"; do
    if ! grep -q "^$f" <<<"$contents"; then
        echo "错误：包内缺少 $f" >&2
        exit 1
    fi
done

echo "---- 待部署产物 ----"
ls -lh "$TARBALL" "$PACKAGE_JSON"

echo "==> 5/5 部署（ansible）"
read -r -p "确认部署到线上 hdwzgzs.cn ？[y/N] " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "已取消部署"
    exit 0
fi

cd "$ALMA_DIR"
sh run.sh manage_webpage/maia/playbook-maia-deploy.yaml
echo "部署完成"