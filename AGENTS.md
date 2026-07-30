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
- [x] `index.astro` 改为 301 重定向到 `/display/studio`
- [x] 写入 `PROJECT-REFERENCE.md`（项目参考手册）
- [ ] 按规范建目录结构（`src/layouts/`、`src/components/`、`src/data/` 等）
- [ ] 从旧 `maia` 项目搬工具函数（`useThemeObserver.ts`、`eventBus.ts` 等）

## 标准开发流程

### 启动开发服务器

```
astro dev --background       # 后台启动
astro dev logs               # 查看日志
astro dev stop               # 停止
astro dev                    # 前台启动（Ctrl+C 停止）
```

### 新建一个部门页面

```
1. 创建布局:      src/layouts/display/xxxLayout.astro
2. 创建页面:      src/pages/display/xxx.astro
3. 创建数据文件:  src/data/xxx.ts
4. 创建样式:      src/styles/pages/xxx.css
5. 创建组件目录:  src/components/display/xxx/
```

### 技术规范

- 遵循文档：`修改与重构-文档/09-Astro模板设计规范.md`
- 主题系统：cookie `theme=dark|light` + `<html class="dark">`
- CSS：纯 CSS，不用 Tailwind
- 框架：Astro 7 + Vue 3 islands
- 构建：`pnpm run build` → `dist/client` + `dist/server`
- 启动：`node ./dist/server/entry.mjs`

## 相关文档目录

```
修改与重构-文档/
├── 00-架构决策与统一规范.md
├── 01-项目技术架构总览.md
├── 02-studio.astro技术架构与重构方案.md
├── 03-页面重构标准规范.md
├── 04-完整文件清单与依赖手册.md
├── 05-SEO优化方案.md
├── 06-web.html分析与改造方案.md
├── 07-网页部协作规范.md
├── 08-Astro框架使用指南.md
├── 09-Astro模板设计规范.md
└── README.md
```
