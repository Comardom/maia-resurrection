# SEO 优化方案汇总（06）

> 汇总本项目（`maia-resurrection`）涉及到的**全部 SEO 优化措施**，按「配置 → 头部 meta → 数据结构 → 抓取控制 → 交互兼容 → 语义规范」分层整理。
> 依据：`src/layouts/StudioLayout.astro`、`../src/data/studio.ts`、`public/robots.txt`、`public/sitemap.xml`、`astro.config.mjs`、`src/pages/index.astro`、`Header.astro`、`FullScreenPhoto.astro`，以及 `designing/03`、`designing/05` 等文档。

## 一、总览

| # | 优化项 | 载体 | 状态 |
|---|--------|------|------|
| 1 | 正式域名 + `astro.config.mjs` 的 `site` | `astro.config.mjs:9` | ✅ 已落地 |
| 2 | `<html lang="zh-CN">` | `StudioLayout.astro:14` | ✅ |
| 3 | `<title>` / `<meta name="description">` | `StudioLayout.astro:18-19`（数据源 `studio.ts`） | ✅ |
| 4 | `<link rel="canonical">`（服务端 URL，不含 hash） | `StudioLayout.astro:20` | ✅ |
| 5 | favicon 跟随系统深浅色 | `StudioLayout.astro:22-42` | ✅ |
| 6 | Open Graph 全套（含 site_name / locale / PNG image） | `StudioLayout.astro:44-52` | ✅ |
| 7 | Twitter Card | `StudioLayout.astro:52` | ✅ |
| 8 | JSON-LD Organization（logo + sameAs） | `StudioLayout.astro:55-62` | ✅ |
| 9 | SEO 元数据全部数据化，单点维护 | `../src/data/studio.ts` | ✅ |
| 10 | `robots.txt`（Allow all + Sitemap 指向） | `public/robots.txt` | ✅ |
| 11 | `sitemap.xml`（干净路径，不含 hash） | `public/sitemap.xml` | ✅ |
| 12 | 根路径 301 → `/studio` | `src/pages/index.astro` | ✅ |
| 13 | 全屏翻页 hash 路由不影响 SEO | `designing/05` 结论 | ✅ 已规避 |
| 14 | 首屏图 `loading="eager"`（LCP） | `FullScreenPhoto.astro:6-7` | ✅ |
| 15 | alt 语义规范（装饰空 alt / logo 读屏去重） | `Header.astro`、`FullScreenPhoto.astro` | ✅ |
| 16 | 单一 `<h1>`（站点名） | `FullScreenPhoto.astro:9` | ✅ |
| 17 | `.cn` 辅助域名 301 → 主域名 | — | ⏳ 待部署 |
| 18 | 部门/时间线子页加入 sitemap | — | ⏳ 待迁移 section 2/3 |

---

## 二、域名与站点基础配置

### 2.1 正式域名

- 主域名：`https://hdwzgzs.cn`（新加坡服务器，**无海外 SEO 需求，未购买 `henuws.com`**）
- `.cn` 辅助域名：计划配置 301 跳转到主域名（未落地）
- 域名统一维护在 `../src/data/studio.ts` 的 `site.url`，**换域名只改这一处**

### 2.2 `astro.config.mjs` 的 `site`

```js
// astro.config.mjs:9
studio: 'https://hdwzgzs.cn',
```

这是 canonical、sitemap、OG 等**绝对 URL 拼接的基准**，必须与正式域名一致。

---

## 三、页面头部 SEO（`StudioLayout.astro`）

### 3.1 语言与基础标签

```html
<html lang="zh-CN" class={isDark ? 'dark' : ''}>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={Astro.url} />
```

- `lang="zh-CN"`：声明页面语言，利于搜索引擎/浏览器正确解析（曾考虑过 ZHTW 变体，当前为简体）
- `<title>`：`河南大学网站工作室 | HENU Web Studio`（中文名 + 英文名，关键词前置）
- `description`：一句话定位（成立年份/归属/职责）
- `canonical`：用**服务端 `Astro.url`**，保证永远是干净的 `https://hdwzgzs.cn/studio`，不掺入前端 hash（见 §五）

### 3.2 favicon 跟随系统深浅色

```html
<link rel="icon" type="image/svg+xml" media="(prefers-color-scheme: dark)" href={studio.logo.dark} id="favicon" />
<link rel="icon" type="image/svg+xml" media="(prefers-color-scheme: light)" href={studio.logo.light} />
```

- 双 `<link media=...>` 按系统偏好加载白/黑 logo
- 内联 `matchMedia` 脚本监听 `prefers-color-scheme` 变化实时切换（`StudioLayout.astro:28-42`）
- 注意：内联脚本里的路径 `/wswd-white.svg`、`/wswd-black.svg` 是**硬编码**，需与 `site.logo.*` 保持一致

### 3.3 Open Graph（社交分享卡片）

```html
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content="website" />
<meta property="og:site_name" content={studio.name} />
<meta property="og:locale" content="zh_CN" />
<meta property="og:url" content={Astro.url} />
<meta property="og:image" content={studio.url + studio.logo.og} />
```

| 字段 | 值 | 说明 |
|------|-----|------|
| `og:image` | `https://hdwzgzs.cn/wswd-blue-007ACC.png` | **1200×1200 PNG**（SVG 不被 FB/X 支持，已替换） |
| `og:site_name` | 河南大学网站工作室 | 补全 |
| `og:locale` | `zh_CN` | 补全 |

### 3.4 Twitter Card

```html
<meta name="twitter:card" content="summary_large_image" />
```

大图卡片；title/description/image 未单独声明，回退使用 OG 标签。

### 3.5 JSON-LD 结构化数据（Organization）

```html
<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": studio.name,
  "url": studio.url,
  "logo": studio.url + studio.logo.og,
  "sameAs": studio.social,
})} />
```

- `@type: Organization`：声明机构实体，利于知识图谱展示
- `logo`：绝对 URL 指向 PNG
- `sameAs`：B站 `https://space.bilibili.com/378145694`（来自 `studio.social`，数据驱动，可扩展）
- 用 `set:html` 输出 JSON，避免花括号被 Astro 当作表达式

### 3.6 可扩展点

```html
<slot name="head" />
```

布局预留 `head` 插槽，子页面可注入页面级 SEO（如文章页加 `og:type=article`）。

---

## 四、数据层：SEO 元数据单点维护（`../src/data/studio.ts`）

原先 title/description/JSON-LD/OG 全部硬编码在组件里，改为统一数据文件：

| 字段 | 用途 |
|------|------|
| `name` / `nameEn` | 站名（title、alt、JSON-LD、版权） |
| `title` | `<title>` |
| `description` | meta description + og:description |
| `url` | 域名（canonical / og:url / sitemap / JSON-LD 拼接基准） |
| `logo.light` / `logo.dark` | 亮/暗 logo（favicon + 顶栏） |
| `logo.og` | OG 分享图（PNG） |
| `social` | JSON-LD `sameAs` |

> **核心收益**：SEO 文案不再散落各处，改域名/改文案只动一个文件；各标签引用同源数据，不会不同步。

---

## 五、抓取控制：robots.txt 与 sitemap.xml

### 5.1 `public/robots.txt`

```
User-agent: *
Allow: /

Sitemap: https://hdwzgzs.cn/sitemap.xml
```

允许全站抓取，并显式声明 sitemap 位置。

### 5.2 `public/sitemap.xml`

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://hdwzgzs.cn/studio</loc>
    <lastmod>2026-08-02</lastmod>
  </url>
</urlset>
```

- 只列**干净路径**（`/studio`），**不列 `#Prologue` 之类 hash**（见 §六）
- 新增部门页面时按 `AGENTS.md` 规范补一条 `<url>`
- IDE 对 XSD 命名空间的无害警告可忽略

---

## 六、全屏翻页 hash 路由与 SEO 的兼容性（关键结论）

来源：`designing/05-全屏翻页与滚动交互排错经验.md`

本项目用 hash 做全屏翻页状态同步（`/studio` → `/studio#Prologue` 等），已验证**对 SEO 无影响**：

1. **服务器收不到 hash**：浏览器发请求时不会带上 `#` 之后的内容，SSR 渲染的 HTML 与 hash 无关
2. **canonical / og:url 保持干净**：它们用服务端 `Astro.url`，永远是 `https://hdwzgzs.cn/studio`
3. **sitemap 只列干净路径**：`/studio`，不含任何 hash

**原则**：`syncHash` 用 `history.replaceState`（不产生历史记录污染），初始 `/studio` 会带 hash 重写地址栏，但**不触发任何网络请求**，抓取端看到的仍是干净 URL。

---

## 七、301 与页面结构

### 7.1 根路径 301 → `/studio`

```astro
---
return Astro.redirect('/studio', 301)
---
```

`https://hdwzgzs.cn/` 永久重定向到 `/studio`，避免内容双份（PR 集中），且 301 对 SEO 友好。

### 7.2 单一 H1

`FullScreenPhoto.astro:9` 只有一个 `<h1>{site.name}</h1>`，页面主题明确。

---

## 八、图片与 alt 语义（SEO + 无障碍）

| 场景 | 规则 | 落地位置 |
|------|------|----------|
| 纯装饰图标（主题/菜单/关闭按钮内） | `alt=""`（避免读屏读路径） | `Header.astro:9,10,23,24,37,38` |
| 承载内容的 logo（亮） | `alt={site.name}` | `Header.astro:15` |
| 承载内容的 logo（暗） | `alt={site.name}` + **`aria-hidden="true"`**（读屏只读一次） | `Header.astro:16` |
| 首屏装饰照片 | `alt=""`（信息已由 h1 承载） | `FullScreenPhoto.astro:6-7` |

> dark logo 不能删 alt（防 SVG 加载失败时输出文件名），只隐藏读屏。

### 8.1 首屏图片加载策略（LCP）

```html
<img class="photo photo-light" src={studio.hero.light.src} alt="" loading="eager" />
```

首屏两张照片均 `loading="eager"`（不懒加载），确保 LCP 快速；懒加载只应给首屏以下的内容。

### 8.2 关联的无障碍（辅助 SEO 语义）

- 应用中心弹窗：`role="dialog"` + `aria-modal` + `aria-labelledby` + `inert`（`Header.astro:30`）
- 状态同步：`aria-expanded` / `aria-hidden` / `inert` 在 JS 中同步修改（`headerScript.ts`）

---

## 九、验证方式（自检清单）

```bash
pnpm typecheck          # 0 errors
pnpm build              # 通过
```

SSR 输出核对（`curl http://<host>:4321/studio` 查源码）：

- [ ] `<html lang="zh-CN">`
- [ ] `<title>` = `河南大学网站工作室 | HENU Web Studio`
- [ ] `<link rel="canonical" href="https://hdwzgzs.cn/studio">`
- [ ] `og:site_name` / `og:locale` / `og:image`（绝对 PNG URL）正确
- [ ] JSON-LD Organization 含 `logo` + `sameAs`
- [ ] `https://hdwzgzs.cn/` 返回 301 → `/studio`
- [ ] `https://hdwzgzs.cn/robots.txt` 可访问且指向 sitemap
- [ ] `https://hdwzgzs.cn/sitemap.xml` 只含干净路径

---

## 十、后续待办（未落地）

| 事项 | 说明 |
|------|------|
| `.cn` 辅助域名 301 → `hdwzgzs.cn` | 服务器部署阶段配置 |
| 迁移 section 2（部门介绍）/ section 3（时间线）后更新 sitemap | 新页面加入 `<url>`，`lastmod` 同步 |
| 部门子页若上线，考虑独立 `<title>` / `og:type`（通过 `<slot name="head" />`） | 提升长尾关键词覆盖 |
