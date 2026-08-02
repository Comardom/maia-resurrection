# 数据层、SEO 与样式重构计划（03）

> 状态：**已完成** — 全部落地并通过验证（typecheck / build / SSR 输出核对）
> 对应讨论：用户提出 4 个问题 → 已确认方向 → 已逐项实现
> 补充：后续追加了 robots.txt / sitemap.xml 与域名决策（`henuws.com`）

## 背景

原计划针对 `Header.astro`、`studio.astro`、`StudioLayout.astro` 的四个问题：

1. **内容全部写死**，没有从 data 文件读取（`src/data/` 目录为空）
2. **alt 语义**是否正确需要确认（logo 图 alt 重复问题）
3. **SEO 有缺陷**（og:image 用 SVG、缺 site_name/locale、JSON-LD 不完整）
4. **颜色硬编码**在 Header 的 `<style>` 里，没有抽成独立变量文件

**四项均已解决，见下文各章节落地记录。**

---

## 已确认决策（用户拍板）

| 议题 | 决策 |
|------|------|
| 数据抽取边界 | **全站级 data**：建 `src/data/site.ts`，统一放站名、描述、logo、链接、磁贴、SEO 元数据 |
| 双 logo 重复读屏 | 第二个 `<img>`（dark）加 `aria-hidden="true"` |
| 颜色提取方式 | 单独建一个 **`studioColor.css`**，Header 颜色全部引用其 CSS 变量 |
| SEO 处理程度 | **layout 补全 + 数据化**（补 og:site_name / og:locale / JSON-LD logo 等，并把 title/desc 收进 data） |

---

## 1. 数据层：新建 `src/data/site.ts`

### 现状问题

- `src/data/` 目录**不存在任何文件**（`AGENTS.md` 中标注为未完成项）
- `studio.astro:5-8` 的 `title`/`description` 硬编码
- `Header.astro` 的标题文字、磁贴链接（论坛/考试系统）、logo 路径硬编码
- `StudioLayout.astro` 的 SEO 文案（JSON-LD、og:description）硬编码

### 目标结构

```ts
// src/data/site.ts
export const site = {
  name: '河南大学网站工作室',
  nameEn: 'HENU Web Studio',
  description: '河南大学网站工作室成立于2001年，隶属河南大学党委宣传部，'
    + '是河大官方学生技术团队，承担官网、新闻网等网站集群的建设与维护工作。',
  // domain 需确认正式域名后填写（影响 canonical / og:url 拼接方式）
  logo: {
    light: '/wswd-black.svg',
    dark: '/wswd-white.svg',
    og: '/wswd-blue-007ACC.svg',
  },
  links: {
    forum: '/nihilum',
    exam: 'https://exam.xn--2qqp2vw2b55cnt3a7mt1eh.cn/',
  },
  social: { /* sameAs 平台链接 —— 待用户提供 */ },
}
```

### 引用改造清单

| 文件 | 改动 |
|------|------|
| `src/pages/studio.astro` | `import { site }`，`title`/`description` 从 `site` 读取 |
| `src/components/studio/Header.astro` | `import { site }`，标题文字、磁贴链接、logo 路径全部引用 `site` |
| `src/layouts/StudioLayout.astro` | title/description、JSON-LD、og 字段引用 `site` |

---

## 2. alt 处理

### 现状（已正确）

- 装饰性图标（主题/菜单/关闭按钮内的 `<img>`）：`alt=""` ✅ 正确
- 承载内容的 logo：`alt="河南大学网站工作室"` ✅ 正确

### 唯一问题

亮/暗两个 logo `<img>`（`Header.astro:14-15`）都会渲染，屏幕阅读器会**读两次**站名。

### 方案

`Header.astro:15` 的第二个 logo（dark）加 `aria-hidden="true"`，读屏只读一次。
注意：不能删掉该 img 的 alt（防 SVG 失败时输出文件名），只隐藏读屏。

---

## 3. SEO 补全（StudioLayout.astro）

### 现状已有的

- `<title>`、`<meta name="description">`、`<link rel="canonical">`
- OG：title / description / type / url / image
- twitter:card = summary_large_image
- JSON-LD：Organization（仅 name + url）
- `<html lang="zh-CN">`、favicon

### 缺陷与补全清单

> 状态：**全部已落地**，SSR 输出已核对（og:site_name / og:locale / og:image / JSON-LD logo+sameAs 均正确渲染）

| # | 缺陷 | 补全 | 状态 |
|---|------|------|------|
| 1 | `og:image` 用 **SVG**，Facebook/X 不支持 | 换 PNG（`public/wswd-blue-007ACC.png`，1200×1200） | ✅ |
| 2 | 缺 `og:site_name` | 补 `site.name` | ✅ |
| 3 | 缺 `og:locale` | 补 `zh_CN` | ✅ |
| 4 | JSON-LD Organization 缺 logo | 补 `"logo"`（`site.url + site.logo.og`） | ✅ |
| 5 | JSON-LD 缺 `sameAs` | 补 B站 `https://space.bilibili.com/378145694` | ✅ |
| 6 | title/description 等元数据硬编码 | 全部从 `site.ts` 读取 | ✅ |
| 7 | `title` 格式待确认 | 保留 `河南大学网站工作室 | HENU Web Studio` | ✅ |

**额外落地**：新建 `public/robots.txt`、`public/sitemap.xml`；`astro.config.mjs` 补 `site: 'https://henuws.com'`。`sitemap.xml` 中 IDE 对 XSD 命名空间提示为无害警告，不影响 SEO，保持现状。

---

## 4. 颜色提取：新建 `../src/css/nonGlobal/studioColor.css`

### 现状问题

- `src/css/theme.css` 已有全局 `:root` / `.dark` 变量（bg/color/link/button）
- 但 `Header.astro` 里大量**硬编码颜色**未走变量：
  - `#f5f5f5`、`#2c2c2c`、`#333`、`#f0f0f0`（顶栏/面板）
  - `#bebebe`、`#8a8a8a`（圆框边框）
  - `rgba(20,20,20,0.2)`、`rgba(255,255,255,0.2)`（分隔线）
  - `rgba(128,128,128,0.15)`（hover）
  - `rgba(0,0,0,0.4)`（backdrop）
  - `#007ACC`、`#0a8ad6`（磁贴）

### 方案

新建 `../src/css/nonGlobal/studioColor.css`，模仿 `theme.css` 的结构，`:root` / `.dark` 内定义一组 `--studio-*` 变量（亮/暗两套），并在 `StudioLayout.astro` 引入。Header.astro 全部硬编码颜色改为 `var(--studio-*)`。

**可行性与注意**：
- Header 的 `<style>` 是 scoped 的，但 `var()` 读取 `:root`/`.dark` 上定义的变量，跨文件正常生效
- `.dark` 在 `<html>` 上，Header 里已用 `:global(.dark)` 模式，变量层无需改
- 变量命名与分组已在下方最终确定

### 已落地变量表（2025-08-01）

最终变量命名与初稿略有调整：

| 变量 | 亮色 | 深色 | 用途 |
|------|------|------|------|
| `--studio-topbar-bg` | `#f5f5f5` | `#2c2c2c` | 顶栏背景 |
| `--studio-topbar-color` | `#333` | `#f0f0f0` | 顶栏文字 |
| `--studio-topbar-border` | `rgba(20,20,20,.2)` | `rgba(20,20,20,.2)` | 顶栏底部分隔线 |
| `--studio-panel-bg` | `#fff` | `#2c2c2c` | 弹窗面板背景 |
| `--studio-panel-color` | `#333` | `#f0f0f0` | 弹窗文字 |
| `--studio-panel-border` | `rgba(20,20,20,.2)` | `rgba(255,255,255,.2)` | 关闭竖条两侧分隔线 |
| `--studio-ring` | `#bebebe` | `#bebebe` | 主题/应用菜单圆框（保持 `#bebebe`） |
| `--studio-ring-close` | `#bebebe` | `#8a8a8a` | 关闭圆框（深色用 `#8a8a8a`） |
| `--studio-backdrop` | `rgba(0,0,0,.4)` | `rgba(0,0,0,.4)` | 遮罩层 |
| `--studio-hover-bg` | `rgba(128,128,128,.15)` | `rgba(128,128,128,.15)` | hover 底色 |
| `--studio-tile` | `#007ACC` | `#007ACC` | 磁贴背景 |
| `--studio-tile-hover` | `#0a8ad6` | `#0a8ad6` | 磁贴 hover |
| `--studio-tile-color` | `#fff` | `#fff` | 磁贴文字 |

> 与初稿的差异：`--studio-border` 拆成 `--studio-topbar-border` / `--studio-panel-border`；`--studio-ring` 拆出 `--studio-ring-close`（因深色下主题/菜单圆框保持 `#bebebe`，仅关闭圆框用 `#8a8a8a`）；新增 `--studio-tile-color`。

### 落地状态

- [x] 新建 `../src/css/nonGlobal/studioColor.css`（`:root` / `.dark` 两套变量）
- [x] `StudioLayout.astro` 引入 `studioColor.css`
- [x] `Header.astro` 全部硬编码颜色替换为 `var(--studio-*)`（已 `rg` 校验无残留）
- [x] `pnpm typecheck`、`pnpm build` 通过

---

## 改动文件汇总（实际落地）

| 文件 | 操作 |
|------|------|
| `src/data/site.ts` | **新建** — 全站数据（站名/描述/域名/logo/磁贴链接/sameAs） |
| `src/css/nonGlobal/studioColor.css` | **新建** — Header 颜色变量（亮/暗两套） |
| `src/layouts/StudioLayout.astro` | **修改** — SEO 补全（og:site_name/locale、JSON-LD logo+sameAs）、数据化 |
| `src/pages/studio.astro` | **修改** — title/desc 走 data、修正 studioColor.css 导入路径 |
| `src/components/studio/Header.astro` | **修改** — 数据化 + dark logo 加 aria-hidden |
| `public/robots.txt` | **新建** — Allow all + Sitemap 指向 |
| `public/sitemap.xml` | **新建** — 列 `https://henuws.com/studio` |
| `astro.config.mjs` | **修改** — 补 `site: 'https://henuws.com'` |

> 注：`studioColor.css` 最终位于 `src/css/nonGlobal/`（非 `src/css/` 根目录），由 `studio.astro` 导入（而非 `StudioLayout`）。

## 验证结果

- `pnpm typecheck`：0 errors / 0 warnings / 0 hints
- `pnpm build`：通过
- SSR 输出核对：og:site_name、og:locale、og:image（PNG 绝对路径）、JSON-LD logo+sameAs、robots.txt、sitemap.xml 均正确
- 真机/模拟器 375px、768px 断点与呼吸动画：验证通过

---

## 待用户提供 / 确认（已全部解决）

1. ~~`og:image` 用的 **PNG/JPG 图片**~~ → `wswd-blue-007ACC.png`（1200×1200）✅
2. ~~**sameAs** 平台链接~~ → B站 `https://space.bilibili.com/378145694` ✅
3. ~~**正式域名**~~ → `henuws.com`（辅助域名 `河大网站工作室.cn` 走 301 跳转，部署层处理）✅
4. ~~`title` 格式~~ → 保留 `河南大学网站工作室 | HENU Web Studio` ✅
