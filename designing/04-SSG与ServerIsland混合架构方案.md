# SSG 主体 + Server Island 混合架构方案（04）

> 状态：**暂缓 / 未实施** — 已评估，当前维持全站 SSR
> 决策：站点目前主要就 `studio` 一页、部署于新加坡服务器（境外），SSR 满足需求且深色模式首帧零跳变。**不切换 SSG/hybrid**，留作未来页面增多或托管方式变化时的备选方案。
> 目标（备选）：把当前全站 SSR 改为「SSG 静态为主体 + 局部服务端岛屿」，同时保证深色模式首帧无跳变
> 依据：Astro 官方文档《On-demand rendering》《Server islands》

---

## 1. 背景与现状

### 1.1 当前架构（全站 SSR）

```
astro.config.mjs  output: 'server'  +  @astrojs/node adapter
```

- `studio.astro` → `StudioLayout.astro`（读 cookie 定深色）→ `Header.astro`
- `StudioLayout.astro:2` `Astro.cookies.get('theme')` 决定 `<html class="dark">`
- `index.astro:2` 用 `Astro.redirect('/studio', 301)` 运行时重定向
- `headerScript.ts` 只负责**点击切换**主题，初始判定完全靠服务端 cookie

### 1.2 问题

1. 页面内容几乎全静态（顶栏、磁贴、链接、SEO meta），却每次请求都走 Node 渲染
2. 无法放 CDN / 纯静态托管，TTFB 受服务端计算影响
3. 但**深色模式首帧判定依赖 cookie**——这是 SSG 的难点，用户明确要求不能跳变

### 1.3 结论

直接砍掉 SSR 不现实；纯 SSG + 客户端脚本可以，但那是"妥协版"。**Astro 的 Server Islands 提供第三条路**：页面保持 SSG，指定组件按需 SSR。

---

## 2. 目标架构

```
整体 SSG（构建时生成静态 HTML，可放 CDN / 静态托管）
  └─ 静态主体：studio 页面、布局、Header 全部预渲染
       └─ server:defer island：负责读 cookie → 输出 <html class="dark">
```

- 页面其余部分零服务端成本
- 只有主题判定那"一小块"在浏览器加载后按需请求 `/_server-islands/xxx`，服务端返回正确的深色 class
- 首帧深色正确，无跳变，与现在 SSR 行为一致

### 2.1 Server Islands 机制（官方文档摘要）

1. 构建时：页面预渲染为静态 HTML，标记 `server:defer` 的组件被替换成一段小脚本 + fallback 内容
2. 运行时：浏览器加载后，脚本单独请求专用端点（`/_server-islands/组件名`），服务端按需渲染该组件并返回 HTML
3. 只此组件走 SSR，其余保持静态；支持缓存（`Cache-Control`）
4. **可移植**：不依赖特定基础设施，Node/Serverless 均可跑

### 2.2 前提条件

- 需安装 adapter —— 项目已装 `@astrojs/node` ✅
- `server:defer` 组件内可以用 `Astro.cookies`、fetch 等 on-demand 特性 ✅

---

## 3. 深色模式方案（核心）

### 3.1 关键点：`<html>` 是布局的根，不是组件

`<html class="dark">` 在 `StudioLayout.astro` 里，而 server island 是**组件**，无法直接控制页面的 `<html>` 标签。

### 3.2 两种实现路线

#### 路线 A：主题判定做成一个「组件内联脚本 island」

把「读 cookie → 决定是否加 class」抽成一个小组件 `ThemeHead.astro`，用 `server:defer` 放在 `<head>` 里。但问题：

- `<head>` 里的元素（含 inline script）在静态 HTML 里已生成，island 是异步替换的，会**晚于首帧** → 反而造成跳变。❌

#### 路线 B：页面本身保留「极小的 on-demand 壳」，内部再包静态内容

- `studio.astro` 标记 `export const prerender = false`（on-demand）
- 页面 HTML 只有一层薄壳（读 cookie → `<html class="dark">`），其余全部引用**静态预渲染的组件**
- 页面级 on-demand 可读 cookie，输出正确的 `<html class>`，首帧即正确
- 其他**子页面**（未来新增的部门页等）仍可纯静态

> 这是目前**保证深色首帧无跳变的最稳做法**：判定发生在服务端首次组装 HTML 时，和现在 SSR 完全等价，不引入任何客户端时序。

### 3.3 方案选择建议

| 路线 | 首帧无跳变 | 主体静态化 | 复杂度 |
|------|-----------|-----------|--------|
| A（head 里 island） | ❌ 会晚于首帧 | ✅ | 中 |
| **B（薄 on-demand 壳）** | ✅ 等同现状 | ✅ | 低 |
| 纯 SSG + 内联脚本 | ✅（脚本先于绘制） | ✅ | 中（需写客户端脚本） |

**推荐路线 B**。它实质是 `output: 'hybrid'` 的单页 on-demand，其余页面纯静态。是否把「壳」进一步做成本地渲染 island（route B'），见第 8 节待确认项。

---

## 4. 具体改动清单（路线 B）

| 文件 | 操作 | 说明 |
|------|------|------|
| `astro.config.mjs` | 修改 | `output: 'server'` → `output: 'hybrid'`（保留 node adapter） |
| `src/pages/studio.astro` | 修改 | 顶部加 `export const prerender = false`；主体仍是 `<StudioLayout>` + `<Header>` |
| `src/layouts/StudioLayout.astro` | 不动 | 继续 `Astro.cookies.get('theme')`，在 on-demand 页面下生效 |
| `src/components/studio/Header.astro` | 不动 | 静态组件，无改动 |
| `src/components/studio/headerScript.ts` | 不动 | 点击切换逻辑不变 |
| `index.astro` | 修改 | `Astro.redirect` 需运行时 → 改为 config `redirects` 或保留 on-demand |
| `src/pages/其他静态页` | 可选 | 默认即静态，无需加 `prerender` |

### 4.1 `astro.config.mjs`

```js
export default defineConfig({
    output: 'hybrid',   // 静态为主体，局部 on-demand
    adapter: node({ mode: 'standalone' }),
    // ...其余不变
})
```

> `output: 'hybrid'` 下，**默认所有页面仍预渲染为静态**；只有显式 `prerender = false` 的页面才走运行时。这与现状行为方向相反（server 是默认全部 on-demand），需逐页确认。

### 4.2 `src/pages/studio.astro`

```astro
---
export const prerender = false;   // 仅此页 on-demand（读 cookie 定深色）
import StudioLayout from "@/layouts/StudioLayout.astro";
import Header from "@/components/studio/Header.astro";
---
<StudioLayout ...>
    <Header />
</StudioLayout>
```

### 4.3 `index.astro` 重定向

`Astro.redirect()` 只在 on-demand（运行时）页面可用。两种改法：

```js
// 改法 1：保持 on-demand
export const prerender = false;
return Astro.redirect('/studio', 301)
```

```js
// 改法 2：config 静态重定向（astro.config.mjs）
redirects: { '/': '/studio' },   // 默认 308，可用 /defineConfig 选项调成 301
```

---

## 5. 若走「纯 SSG + 内联脚本」的备选（供对比）

若你接受不依赖服务端判定的做法，可完全静态：

1. `output: 'static'`，删除 node adapter
2. `StudioLayout.astro` 里 `<head>` 加同步内联脚本读 cookie 设 class（`<script is:inline>`）
3. `headerScript.ts` 不变
4. `index.astro` 重定向改 config `redirects`

**代价**：JS 禁用时恒浅色（可接受）；多维护一段内联脚本。**收益**：完全无服务器依赖。

---

## 6. 需要注意的坑

1. **`Astro.url` 在 server island 内不可靠**：`server:defer` 组件里 `Astro.url` 返回 `/_server-islands/组件名` 而非页面 URL。需要页面 URL 时用 `Referer` 头。
2. **props 需可序列化**：传给 `server:defer` 组件的 props 不能含函数、循环引用。
3. **Response 头只在页面级可用**：组件内改不了 response headers。
4. **props 加密密钥**：rolling 部署 / 多区域时，加密 props 的 key 需固定（`astro create-key` + `ASTRO_KEY`）。
5. **改 `output` 后全站默认行为反转**：`hybrid` 下所有现有页面**自动变回静态**。要逐个确认哪些页面需要 on-demand（当前只有 `studio` 和 `index` 需要运行时）。
6. **`studio.astro` 目前 import 了 `/src/css/studioColor.css`**（`studio.astro:4`），与 `StudioLayout` 里 `theme.css` 分层；切换输出模式不影响 CSS 打包。

---

## 7. 验证方式

1. `pnpm typecheck`、`pnpm build`
2. `node ./dist/server/entry.mjs` 启动，确认：
   - `/studio` 返回完整 HTML，`<html>` 带正确的 `dark` class（按 cookie）
   - 深色 cookie 下打开页面**首帧即深色**，无闪白
   - 切换主题 → 刷新 → 主题保持，无跳变
3. `dist/client` 里确认 `/studio` 生成的是**静态 HTML 文件**（hybrid 下 on-demand 页会输出 server 入口，需核对输出结构）
4. 无 cookie / 浅色默认时页面正常渲染浅色

---

## 8. 待用户确认

1. **路线选择**：路线 B（薄 on-demand 壳，推荐）vs 纯 SSG + 内联脚本？还是先小范围验证再定？
2. **`index.astro` 重定向**：保留 on-demand 页（改法 1）还是用 config `redirects`（改法 2）？
3. **是否真需要 server island**：若只处理主题，其实 `studio.astro` 单页 on-demand 即可，不必引入 `server:defer`。是否要把「未来可能有动态内容的其他页」也纳入规划？
4. 确认后我再逐步细化到每一行改动。
