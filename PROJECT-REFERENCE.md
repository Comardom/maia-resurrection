# 项目参考手册

> 本文件记录 maia-resurrection 项目的文件结构、配置解释和开发规范。
> 读完这个文件，你应该能回答以下问题：
> - 每个文件/目录是干什么的？
> - 哪些是自动生成的？哪些是手写的？
> - 配置文件每一行什么意思？
> - 什么时候需要改什么？

---

## 目录

1. [目录总览](#1-目录总览)
2. [根目录文件详解](#2-根目录文件详解)
   - [package.json](#21-packagejson)
   - [astro.config.mjs](#22-astroconfigmjs)
   - [tsconfig.json](#23-tsconfigjson)
   - [pnpm-workspace.yaml](#24-pnpm-workspaceyaml)
   - [pnpm-lock.yaml](#25-pnpm-lockyaml)
   - [.gitignore](#26-gitignore)
   - [AGENTS.md](#27-agentsmd)
   - [README.md](#28-readmemd)
3. [目录详解](#3-目录详解)
   - [src/](#31-src)
   - [public/](#32-public)
   - [dist/](#33-dist)
   - [node_modules/](#34-node_modules)
   - [.astro/](#35-astro)
   - [.vscode/](#36-vscode)
   - [.idea/](#37-idea)
   - [.git/](#38-git)
4. [常见操作](#4-常见操作)

---

## 1. 目录总览

```
maia-resurrection/
│
├── package.json              ← 手写维护。项目配置、依赖、脚本
├── astro.config.mjs          ← 手写维护。Astro 框架配置
├── tsconfig.json             ← 手写维护。TypeScript 配置
├── pnpm-workspace.yaml       ← 自动生成（可手改）。pnpm 工作区配置
├── pnpm-lock.yaml            ← 自动生成。锁版本，不要手改
├── .gitignore                ← 自动生成（可手改）。Git 忽略规则
├── AGENTS.md                 ← 手写。AI 操作指南
├── README.md                 ← 手写。项目简介（翻译版）
├── PROJECT-REFERENCE.md      ← 手写。本文件
│
├── src/                      ← 手建。源代码目录（你主要在这里工作）
├── public/                   ← 自动生成（可替换）。静态资源
├── dist/                     ← 自动生成。构建产物
├── node_modules/             ← 自动生成。依赖包
│
├── .astro/                   ← 自动生成。Astro 缓存和类型定义
├── .vscode/                  ← 自动生成。VSCode 配置
├── .idea/                    ← 自动生成。WebStorm 配置
└── .git/                     ← 自动生成。Git 仓库数据
```

---

## 2. 根目录文件详解

---

### 2.1 `package.json`

```json
{
  "name": "maia-resurrection",
```
项目名称。用在 `pnpm publish` 时作为包名。如果不是要发布到 npm，这个值不重要。

```json
  "type": "module",
```
**重要。** 告诉 Node.js：这个项目里所有的 `.js` 文件都按 **ES Module** 解析（用 `import`/`export`，不用 `require()`）。如果不设这行，默认是 CommonJS。

```json
  "version": "0.0.1",
```
项目版本号。遵循 `semver`（主版本.次版本.补丁）。目前只是占位，发布时再更新。

```json
  "engines": {
    "node": ">=22.12.0"
  },
```
指定 Node.js 最低版本。Astro 7 需要 Node 22+。如果服务器的 Node 版本低于这个，pnpm install 时会警告。

```json
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "typecheck": "vue-tsc -b && astro check"
  },
```
| 命令 | 作用 | 什么时候用 |
|------|------|-----------|
| `pnpm dev` | 启动开发服务器（localhost:4321） | 日常开发 |
| `pnpm build` | 构建生产版本 → dist/ | 部署前 |
| `pnpm preview` | 本地预览构建结果 | 检查 build 对不对 |
| `pnpm astro ...` | 执行任意 Astro CLI 命令 | 加插件、检查等 |
| `pnpm typecheck` | 跑类型检查（Vue + Astro 分开检查） | 提交前确认代码没错 |

`typecheck` 里做了两件事：`vue-tsc -b` 检查 `.vue` / `.ts` 的类型，`astro check` 检查 `.astro` 的类型。

```json
  "dependencies": {
    "@astrojs/node": "^11.0.2",
    "@astrojs/vue": "^7.0.1",
    "astro": "^7.1.5",
    "vue": "^3.5.40"
  },
```
**生产依赖** —— 运行时需要，构建时会打包进产物。

| 包 | 作用 | 备注 |
|----|------|------|
| `astro` | 框架本身 | 核心 |
| `@astrojs/vue` | Vue 集成，让 Astro 认识 `.vue` | 必须 |
| `@astrojs/node` | Node SSR 适配器 | 必须（否则 SSR 无法运行） |
| `vue` | Vue 3 运行时 | 必须 |

`^` 的意思是"安装兼容版本"，比如 `"astro": "^7.1.5"` 会装 `>=7.1.5` 且 `<8.0.0` 的最新版。

```json
  "devDependencies": {
    "@types/node": "^26.1.2",
    "@vue/tsconfig": "^0.9.1",
    "typescript": "^7.0.2",
    "vue-tsc": "^3.3.8"
  }
```
**开发依赖** —— 只在开发时需要，构建产物里不包含。

| 包 | 作用 | 备注 |
|----|------|------|
| `typescript` | TypeScript 编译器 | 提供 `tsc` 命令和类型检查 |
| `vue-tsc` | Vue 文件的类型检查器 | 用于 `pnpm typecheck` |
| `@vue/tsconfig` | Vue 官方 TS 配置预设 | tsconfig.json 的 `extends` 指向它 |
| `@types/node` | Node.js 的类型定义 | 让 TS 认识 `process`、`Buffer` 等 Node API |

---

### 2.2 `astro.config.mjs`

```js
// @ts-check
```
让 IDE 用 TypeScript 严格模式检查这个 JS 文件。如果传错类型会飘红提示。不影响运行。

```js
import { defineConfig } from 'astro/config';
```
从 Astro 导入 `defineConfig` 函数，接收配置对象并返回类型安全的配置。也可以直接 `export default {}`，但不会有 IDE 提示。

```js
import vue from '@astrojs/vue';
```
导入 Vue 集成插件。不加这行，Astro 不认识 `.vue` 文件。

```js
import node from '@astrojs/node';
```
导入 Node 适配器。告诉 Astro"构建时生成 Node.js 能跑的服务端代码"。

```js
export default defineConfig({
  output: 'server',
```
启用 SSR 模式。默认是 `static`（构建时生成静态 HTML）。设成 `server` 后，每次请求在服务端渲染页面。

```js
  server: {
    host: true,
    port: 4321,
  },
```
`host: true` —— 允许局域网设备访问开发服务器。默认只监听 `localhost`。
`port: 4321` —— 指定端口。Astro 默认就是 4321，不写也行。

```js
  adapter: node({ mode: 'standalone' }),
```
`adapter` —— 告诉 Astro 使用 SSR，必须有。
`node()` —— SSR 的输出格式是 Node.js 的。
`standalone` —— 产物是自包含的 HTTP 服务。直接 `node dist/server/entry.mjs` 就能跑。不需要 Express。

另一种模式是 `middleware`，产物不监听端口，而是导出一个函数让你挂到自己的 Express 服务器上。目前不需要。

```js
  integrations: [vue()],
```
注册 Vue 集成。`.vue` 文件才能被 Astro 识别和编译。

```js
  vite: {
    resolve: {
      alias: { '@': '/src' },
    },
    server: {
      fs: {
        strict: true,
        allow: ['src/', 'node_modules/']
      }
    },
  },
});
```
`vite` 是 Astro 底层的构建工具。`resolve.alias` 设置 `@/` 为 `/src` 的别名，少写 `../../`。`server.fs` 是安全配置，防止用户通过 URL 访问项目目录之外的文件。默认值已经正确，不写也行。

---

### 2.3 `tsconfig.json`

```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
```
`extends` —— 继承一个现成的配置，不用自己从零写。

为什么用 `@vue/tsconfig` 而不是 `astro/tsconfigs/strict`？
- `@vue/tsconfig` 包含 Vue 3 的类型定义（`.vue` 模块声明、`<script setup>` 编译产物类型、JSX 类型）
- `astro/tsconfigs/strict` 只包含 Astro 的类型，不知道 Vue 的存在
- 两者是互补关系：`extends` 走 Vue， `include` 里加上 `".astro/types.d.ts"` 补上 Astro 的类型

```json
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
```
`paths` 让 TypeScript 也认识 `@/` 这个别名。`astro.config.mjs` 里给 Vite 配了别名，但 TS 自己不知道。如果不配双份，TS 会报 `Cannot find module '@/xxx'`。

```json
  "include": [".astro/types.d.ts", "**/*"],
```
`.astro/types.d.ts` 是 Astro 自动生成的类型文件（每次 `astro dev` 或 `astro build` 时生成），包含 `.astro` 文件的模块声明和路由类型。`**/*` 包含所有源文件。

```json
  "exclude": ["dist"]
}
```
构建产物目录不需要类型检查。

---

### 2.4 `pnpm-workspace.yaml`

```yaml
allowBuilds:
  esbuild: true
minimumReleaseAgeExclude:
  - '@astrojs/internal-helpers@0.10.2'
  - '@astrojs/markdown-satteri@0.3.5'
  - astro@7.1.5
```

**什么时候自动生成：** 首次 `pnpm install` 时，pnpm 检测到需要编译原生模块（esbuild）以及新发布但还不到发布年龄的包，自动创建了这个文件。

`allowBuilds` —— pnpm 默认禁止包运行 `postinstall` 脚本（安全考虑）。`esbuild` 需要在安装时编译原生模块，所以放行。

`minimumReleaseAgeExclude` —— pnpm 默认新发布的包要等一段时间才能安装（防止你装到有问题的版本）。Astro 7 太新了，所以排除。

**什么时候需要手动改：** 目前不用。如果你以后要加新的需要编译的包（如 `sharp`、`node-gyp` 等），需要在这里放行。如果你是 monorepo（一个仓库包含多个子项目），需要加 `packages` 字段。

**你的旧项目写成这样：**
```yaml
packages:
  - 'frontend'
  - 'backend'
```
那是 monorepo 的写法，表示这个仓库里包含 `frontend/` 和 `backend/` 两个子项目。你的 maia-resurrection 是一个单包项目，不需要。

---

### 2.5 `pnpm-lock.yaml`

自动生成，**不要手改**。它锁定了所有依赖的精确版本号，保证你和服务器装的是同一套版本。每次 `pnpm install` 或 `pnpm add` 时会自动更新。

---

### 2.6 `.gitignore`

```
dist/              # 构建产物
.astro/            # Astro 缓存 + 自动生成的类型
node_modules/      # 依赖包
.env               # 环境变量（可能含密钥）
.DS_Store          # macOS 系统文件
.idea/             # WebStorm 配置
```

自动生成，可手改。如果你以后有不想提交的文件，加在这里。

---

### 2.7 `AGENTS.md`

AI 操作指南。告诉 AI 助手这个项目的技术规范、开发流程、要注意什么。不是项目文档，不参与构建。

---

### 2.8 `README.md`

项目简介。Astro 模板默认生成的是英文，已翻译为中文。

---

## 3. 目录详解

### 3.1 `src/`

**手建。** 你的源代码都在这。按 09 号规范目录结构：

```
src/
├── layouts/display/     ← 各部门布局文件（手建）
├── pages/display/       ← 各部门页面（手建）
├── components/display/  ← 各部门 Vue 组件（手建）
├── data/                ← 各部门文案和数据（手建）
├── styles/              ← 全局样式 + 页面级样式（手建）
├── utils/               ← 通用工具函数（手建）
└── pages/index.astro    ← 自动生成，待替换
```

`pages/index.astro` 是 Astro 生成模板时自动创建的默认首页，后续会被你自己的首页替换。

---

### 3.2 `public/`

**自动生成（空目录 + favicon）。可替换。**

放静态资源的地方：
- 图片（logo、背景图、icon）
- 字体文件
- favicon（模板自带的 `.ico` 和 `.svg`，你可以换成自己的）

`public/` 里的文件会原样复制到 `dist/client/` 的根目录。比如 `public/logo.svg` 可以通过 `/logo.svg` 访问。

---

### 3.3 `dist/`

**自动生成，不进 git。** `pnpm build` 的输出目录：

```
dist/
├── client/               # 浏览器端文件（HTML/CSS/JS/图片）
│   └── ...
└── server/
    └── entry.mjs         # SSR 入口文件
    └── chunks/           # 服务端代码块
```

部署时：nginx 指向 `dist/client/`，`node dist/server/entry.mjs` 跑 SSR。

---

### 3.4 `node_modules/`

**自动生成，不进 git。** 所有依赖包都装在这里。不要手改。删除后 `pnpm install` 重新生成。

---

### 3.5 `.astro/`

**自动生成，不进 git。** Astro 的运行缓存和类型定义。

```
.astro/
├── types.d.ts        # Astro 自动生成，声明 .astro 文件的模块类型
├── collections/      # 内容集合缓存（如果你用了 Astro Content Collections）
├── settings.json     # 当前项目设置缓存
└── sync/             # 同步锁
```

`types.d.ts` 是最重要的文件。它告诉 TypeScript"`.astro` 文件是一个有效的模块"。没有它，你在 `.ts` 里 `import` 一个 `.astro` 文件会报错。

这个目录只有在你跑过 `astro dev` 或 `astro build` 之后才会出现。

---

### 3.6 `.vscode/`

**自动生成。** VSCode 的编辑器配置。

```
.vscode/
├── extensions.json    # 推荐的 VSCode 插件（如 Vue 插件）
└── launch.json        # 调试配置
```

不影响项目运行。如果你用 WebStorm，这个目录可以删掉。

---

### 3.7 `.idea/`

**自动生成。** WebStorm 的项目配置。如果你用 WebStorm，这里存你的编码风格、运行配置等。如果你的 `.gitignore` 里没有忽略它（默认是忽略的），它不会进 git。

---

### 3.8 `.git/`

**自动生成。** Git 仓库的数据库。不要手改。删了等于删 git 历史。

---

## 4. 常见操作

### 加一个新依赖

```bash
pnpm add 包名          # 加到 dependencies（生产依赖）
pnpm add -D 包名       # 加到 devDependencies（开发依赖）
pnpm remove 包名       # 移除
```

### 更新所有依赖

```bash
pnpm update
```

### 跑类型检查

```bash
pnpm typecheck
# 内部执行：vue-tsc -b && astro check
```

### 构建并启动

```bash
pnpm build
node dist/server/entry.mjs    # 启动 SSR 服务
```

### 清理缓存

```bash
rm -rf dist/ .astro/ node_modules/.vite
pnpm install
```

### 新人接手项目后的第一步

```bash
git clone ...
pnpm install              # 装依赖
pnpm dev                  # 启动开发服务器
```
