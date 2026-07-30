# maia-resurrection

> 河大网站工作室 — 项目重构版
> 基于 Astro 5 + Vue 3 + 纯 CSS

---

# Astro Starter Kit: Minimal
> Astro 空模板起步包

```sh
pnpm create astro@latest -- --template minimal
```
> 用以上命令从空模板创建项目

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!
> （如果你是老手，删掉这个文件自己写吧）

## 🚀 Project Structure
> 项目结构

Inside of your Astro project, you'll see the following folders and files:
> Astro 项目默认包含以下目录和文件：

```text
/
├── public/                    # 静态资源（图片、字体等）
├── src/
│   └── pages/
│       └── index.astro        # 首页
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.
> Astro 会自动将 `src/pages/` 下的 `.astro` 和 `.md` 文件映射为路由。

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.
> `src/components/` 没有特殊含义，只是约定放置组件的地方。

Any static assets, like images, can be placed in the `public/` directory.
> 静态资源（图片等）放在 `public/` 目录。

## 🧞 Commands
> 常用命令

All commands are run from the root of the project, from a terminal:
> 所有命令在项目根目录下运行：

| Command                   | Action                                           | 中文说明                      |
| :------------------------ | :----------------------------------------------- | :--------------------------- |
| `pnpm install`            | Installs dependencies                            | 安装依赖                     |
| `pnpm dev`                | Starts local dev server at `localhost:4321`      | 启动开发服务器               |
| `pnpm build`              | Build your production site to `./dist/`          | 构建生产版本                 |
| `pnpm preview`            | Preview your build locally, before deploying     | 本地预览构建结果             |
| `pnpm astro ...`          | Run CLI commands like `astro add`, `astro check` | 运行 Astro CLI 命令          |
| `pnpm astro -- --help`    | Get help using the Astro CLI                     | 查看 Astro CLI 帮助          |

## 👀 Want to learn more?
> 想了解更多？

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
> 查看 [Astro 官方文档](https://docs.astro.build) 或加入 [Discord 社区](https://astro.build/chat)。
