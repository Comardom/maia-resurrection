# maia-resurrection

> 河南大学网站工作室 — 官网重构版

## 技术栈

- **Astro 7**（`output: server`，Node adapter）
- **Vue 3 islands**（`@astrojs/vue`）
- **纯 CSS**（不用 Tailwind）
- **GSAP**（全屏翻页动画）
- **主题系统**：cookie `theme=dark|light` + `<html class="dark">`

## 命令

所有命令在项目根目录运行：

| 命令             | 说明                            |
| :--------------- | :------------------------------ |
| `pnpm install`   | 安装依赖                        |
| `pnpm dev`       | 启动开发服务器（localhost:4321） |
| `pnpm build`     | 构建生产版本到 `dist/`           |
| `pnpm preview`   | 本地预览构建结果                 |
| `pnpm typecheck` | 类型检查（vue-tsc + astro check） |
