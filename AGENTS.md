# Maia Resurrection — AI 操作指南

> 河大网站工作室项目重构版
> 项目路径：`/home/comardom/WebstormProjects/河大网站工作室网页备份/www/maia-resurrection`

## 项目初始化状态

- [x] `pnpm create astro@latest --template empty`
- [x] `pnpm install`
- [x] `git init`
- [x] 安装核心依赖：`@astrojs/vue`、`@astrojs/node`、`vue`
- [x] 安装开发依赖：`typescript`、`@vue/tsconfig`、`vue-tsc`、`@types/node`、`@astrojs/check`
- [x] 配置 `astro.config.mjs`（SSR、Vue、Node adapter、@ 别名）
- [x] 配置 `tsconfig.json`（extends vue、paths、include）
- [x] `pnpm build` 通过
- [x] `pnpm typecheck` 通过（0 errors）
- [x] `index.astro` 改为 301 重定向到 `/studio`
- [x] 写入 `PROJECT-REFERENCE.md`（项目参考手册）
- [x] 按规范建目录结构（`src/layouts/`、`src/components/studio/`、`src/data/`、`src/css/`）
- [x] 从旧 `maia` 项目搬工具函数（`useThemeObserver.ts`、`eventBus.ts` 等）——当前以原生 JS/CSS 方案替代，未直接搬迁

## 标准开发流程

### 启动开发服务器

```
astro dev --background       # 后台启动
astro dev logs               # 查看日志
astro dev stop               # 停止
astro dev                    # 前台启动（Ctrl+C 停止）
```

### 新建一个部门页面

按当前项目实际结构（参考 `studio.astro` + `StudioLayout.astro` 的做法）：

```
1. 创建页面:      src/pages/xxx.astro          ← 访问 https://hdwzgzs.cn/xxx
2. 复用布局:      src/layouts/StudioLayout.astro（或新建 src/layouts/xxxLayout.astro）
3. 创建数据文件:  src/data/xxx.ts
4. 创建样式:      src/css/nonGlobal/xxx.css
5. 创建组件目录:  src/components/xxx/
6. 更新 sitemap:  public/sitemap.xml 补一条 <url>
```

### 技术规范

- 参考文档：`designing/` 下各方案文档、`ACCESSIBILITY.md`
- 主题系统：cookie `theme=dark|light` + `<html class="dark">`（`StudioLayout.astro` 读 cookie）
- CSS：纯 CSS，不用 Tailwind；颜色抽变量放 `src/css/nonGlobal/studioColor.css`
- 数据层：`src/data/site.ts`（站名/描述/域名/logo/链接，改域名只改 `site.url`）
- 框架：Astro 7 + Vue 3 islands（当前主要用原生 JS，无框架开销）
- 构建：`pnpm run build` → `dist/client` + `dist/server`
- 启动：`node ./dist/server/entry.mjs`

## 相关文档目录

```
designing/
├── 01-顶栏重构-完整流程.md
├── 02-顶栏移动端适配方案.md
├── 03-数据层-SEO-样式重构计划.md
├── 04-SSG与ServerIsland混合架构方案.md
├── 05-全屏翻页与滚动交互排错经验.md
├── 06-SEO优化方案汇总.md
└── 07-贪吃蛇游戏方案.md
ACCESSIBILITY.md   ← 无障碍规范
PROJECT-REFERENCE.md  ← 项目参考手册
```
