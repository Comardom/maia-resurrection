# 无障碍（Accessibility）指南

> 河大网站工作室 · maia-resurrection
> 本文档记录项目中的无障碍实现方案、约定与检查清单。

## 目录

- [一、核心概念](#一核心概念)
- [二、主题切换按钮](#二主题切换按钮)
- [三、应用中心弹窗（全量实现）](#三应用中心弹窗全量实现)
- [四、键盘导航](#四键盘导航)
- [五、屏幕阅读器语义](#五屏幕阅读器语义)
- [六、视觉与动效](#六视觉与动效)
- [七、代码规范约定](#七代码规范约定)
- [八、自查清单](#八自查清单)

---

## 一、核心概念

无障碍（a11y）的目标：让**所有用户**都能使用网站，包括：

| 用户类型 | 需要的辅助 |
|----------|-----------|
| 视觉障碍 | 屏幕阅读器（NVDA / VoiceOver / TalkBack）、高对比度 |
| 运动障碍 | 纯键盘操作、语音控制 |
| 认知障碍 | 可预测的交互、充足的时间 |
| 暂时性障碍 | 强光环境、单手操作 |

**三个原则**：
1. **可感知** —— 信息不能只靠颜色/形状传达
2. **可操作** —— 键盘能到达所有功能
3. **可理解** —— 语义清晰、状态明确

---

## 二、主题切换按钮

### 现状

`Header.astro` 中的 `#theme-toggle` 是深色/浅色模式切换按钮。

### 约定

- 用 `aria-label` 提供可读名称（图标按钮没有可见文字时必须加）
- 图标切换通过 CSS `opacity` 完成，状态由 `html.dark` class 驱动，**不需要**额外 aria 状态
- 颜色对比度：图标用纯黑/纯白 + 背景浅灰/深灰，对比度充足

### 参考代码

```html
<button id="theme-toggle" class="theme-toggle" aria-label="切换主题">
  <img src="/luna-black.svg" class="icon icon-luna-black" alt="" />
  <img src="/solar-white.svg" class="icon icon-solar-white" alt="" />
</button>
```

---

## 三、应用中心弹窗（全量实现）

这是项目里**最复杂**的无障碍场景，已实现完整方案。

### 3.1 HTML 语义

```html
<button
  id="app-menu-toggle"
  class="app-menu-toggle"
  aria-label="打开应用中心"
  aria-expanded="false"
  aria-controls="app-menu"
>
  <img src="/more-black.svg" class="icon icon-more-black" alt="" />
  <img src="/more-white.svg" class="icon icon-more-white" alt="" />
</button>

<div
  id="app-menu"
  class="app-menu"
  role="dialog"
  aria-modal="true"
  aria-labelledby="app-menu-title"
  aria-hidden="true"
  inert
>
  <h2 id="app-menu-title" class="sr-only">应用中心</h2>
  <div class="app-menu-tiles">
    <a href="/nihilum" class="tile"><span>论坛</span></a>
    <a href="..." class="tile"><span>考试系统</span></a>
  </div>
  <button id="app-menu-close" class="app-menu-close" aria-label="关闭应用中心">…</button>
</div>
```

各属性作用：

| 属性 | 作用 |
|------|------|
| `aria-expanded` | 告诉辅助技术弹窗当前开/关 |
| `aria-controls` | 声明这个按钮控制哪个元素 |
| `role="dialog"` | 声明这是对话框 |
| `aria-modal="true"` | 模态：弹窗外的内容不可交互 |
| `aria-labelledby` | 用隐藏标题给弹窗命名 |
| `aria-hidden` | 关闭时对屏幕阅读器隐藏 |
| `inert` | **关闭时从键盘焦点和点击中移除**（关键！） |

> **`inert` 是必须的**。仅 `aria-hidden` 不够——它只管屏幕阅读器，键盘用户仍能 Tab 到隐藏的关闭按钮。`inert` 同时覆盖两者。

### 3.2 交互逻辑（`headerScript.ts`）

打开时：
```ts
menu.classList.add('open')
backdrop.classList.add('open')
menu.removeAttribute('inert')        // 解除禁用
menu.setAttribute('aria-hidden', 'false')
btn.setAttribute('aria-expanded', 'true')
document.body.style.overflow = 'hidden'   // 锁定背景滚动
close.focus()                             // 焦点移入弹窗
```

关闭时：
```ts
menu.classList.remove('open')
backdrop.classList.remove('open')
menu.setAttribute('inert', '')       // 重新禁用
menu.setAttribute('aria-hidden', 'true')
btn.setAttribute('aria-expanded', 'false')
document.body.style.overflow = prev   // 还原滚动
btn.focus()                           // 焦点还给原按钮
```

---

## 四、键盘导航

### 4.1 焦点管理

| 操作 | 行为 |
|------|------|
| 点击打开按钮 | 焦点移到关闭按钮 |
| 关闭（任意方式） | 焦点还给打开按钮 |
| 打开时 Tab | 在弹窗内循环（焦点陷阱） |
| Shift + Tab | 反向循环 |

### 4.2 焦点陷阱实现

```ts
menu.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key !== 'Tab') return
  const focusables = Array.from(menu.querySelectorAll<HTMLElement>('a, button'))
  if (!focusables.length) return
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    last.focus()
    e.preventDefault()
  } else if (!e.shiftKey && document.activeElement === last) {
    first.focus()
    e.preventDefault()
  }
})
```

### 4.3 Esc 关闭

```ts
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu()
})
```

### 4.4 磁贴方向键导航（Metro 网格）

网格布局用方向键移动焦点，而不是逐个 Tab：

```ts
tiles.addEventListener('keydown', (e: KeyboardEvent) => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
  const items = Array.from(tiles.querySelectorAll<HTMLElement>('.tile'))
  const idx = items.indexOf(document.activeElement as HTMLElement)
  const cols = getComputedStyle(tiles).gridTemplateColumns.split(' ').length
  // 计算目标 index：← −1，→ +1，↑ −cols，↓ +cols
  // 在范围内则 focus + preventDefault
})
```

---

## 五、屏幕阅读器语义

### 5.1 `.sr-only` 工具类

视觉隐藏但朗读器可读的类，用于提供上下文：

```css
.sr-only {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**不要用 `display: none` 或 `visibility: hidden`** —— 那会同时从朗读器中移除。

### 5.2 图标按钮必须有 `aria-label`

所有只有图标、没有可见文字的按钮：

```html
<button aria-label="打开应用中心">…</button>
<button aria-label="切换主题">…</button>
```

### 5.3 纯装饰图片用 `alt=""`

纯装饰的图标（无信息内容）设空 alt，避免朗读器读出无意义的路径：

```html
<img src="/more-black.svg" alt="" />
```

### 5.4 语言版本

页面 `<html lang="zh-CN">` 必须与内容语言一致，否则朗读器会用错发音规则。

---

## 六、视觉与动效

### 6.1 动效开关

所有非必要动画都应受 `prefers-reduced-motion` 控制：

```css
@media (prefers-reduced-motion: reduce) {
  .app-menu,
  .app-menu-backdrop {
    transition: none;
  }
}
```

### 6.2 颜色对比度（WCAG AA）

| 元素 | 前景 | 背景 | 对比度 |
|------|------|------|--------|
| 顶栏文字 | `#333` | `#f5f5f5` | ~10:1 ✓ |
| 深色顶栏文字 | `#f0f0f0` | `#2c2c2c` | ~9:1 ✓ |
| 磁贴文字 | `#fff` | `#007ACC` | ~4.5:1 ✓ |

新增配色时保持 ≥ 4.5:1。

### 6.3 不要只靠颜色传达状态

例如错误提示不能只用红色，要配文字/图标。

---

## 七、代码规范约定

1. **交互逻辑放 `headerScript.ts`**，用 `initXxx()` 命名，在 `.astro` 的 `<script>` 中调用
2. **TypeScript**：事件回调显式标注类型（`e: KeyboardEvent`），DOM 查询用 `getElementById` / `querySelector<T>`
3. **null 检查**：所有 `getElementById` 结果先判空再使用
4. **状态同步**：`aria-expanded`、`aria-hidden`、`inert` 必须在 JS 里和 class 同步修改，缺一不可
5. **新增交互组件时**：对照[第八节自查清单](#八自查清单)

---

## 八、自查清单

新增或修改任何可交互组件后，逐项检查：

- [ ] 键盘能到达所有功能（Tab 顺序合理）
- [ ] 无键盘焦点陷阱（除模态弹窗内是刻意的）
- [ ] 可见焦点样式存在（`:focus-visible`）
- [ ] 图标按钮有 `aria-label`
- [ ] 装饰图片 `alt=""`
- [ ] 状态变化同步更新 `aria-expanded` / `aria-hidden`
- [ ] 隐藏的交互元素加了 `inert`（不止 `aria-hidden`）
- [ ] 模态弹窗有 `role="dialog"` + `aria-modal` + `aria-labelledby`
- [ ] 支持 Esc 关闭
- [ ] 动效受 `prefers-reduced-motion` 控制
- [ ] 颜色对比度 ≥ 4.5:1
- [ ] `html lang` 与内容语言一致
- [ ] 触控目标尺寸 ≥ 44×44px

---

## 参考

- [WCAG 2.1 指南](https://www.w3.org/TR/WCAG21/)
- [MDN: Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM 对比度检查器](https://webaim.org/resources/contrastchecker/)
- [inert 属性](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert)
