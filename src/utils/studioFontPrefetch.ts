import { studioFontManifest } from '@/data/generated/studioFontManifest'

/*
 * studio 分页字体后台预取器
 *
 * 这个模块不负责声明字体，也不负责决定某个元素使用什么字体。
 * 字体声明由生成的 @font-face CSS 提供，当前区域的字体由 pageAnimator
 * 通过 document.fonts.load 触发。这里唯一的任务是：当前区域完成初步
 * 加载并进入空闲时，把其他分页区域的 woff2 文件提前放进浏览器缓存。
 *
 * 加载边界必须保持清晰：
 *   Header       → Header 组件自己加载
 *   当前 section → CSS / Font Loading API 加载
 *   其他 section → 本模块低优先级并行预取
 *   Timeline     → 没有自定义字体，不存在于 manifest
 */

// manifest 只包含 studio 的可翻页区域。Header 等共享字体由各自组件加载，
// 不把它们当作可以预取的分页区域。
type StudioSection = keyof typeof studioFontManifest

// 这里的结构类型只保留 URL，因为预取器只需要 URL。生成的 manifest 还包含
// alias 和 sample 字段，供字体实际加载时使用。
type FontEntry = { url: string }

// 网络信息接口不存在于所有 TypeScript DOM 类型库中，但基于 Chromium 的浏览器
// 实际会提供 navigator.connection。
type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } }

// 预取是页面级操作。这个标记可以避免初始化过程中调度器被多次调用时，
// 重复插入 link 元素。
let prefetched = false

function currentSection(): StudioSection {
    // pageAnimator 会给已经稳定显示的区域添加 is-active。如果这里执行时该类
    // 还没有添加，默认使用 Prologue 作为安全回退。
    const id = document.querySelector<HTMLElement>('.snap-section.is-active')?.id
    return id && id in studioFontManifest ? id as StudioSection : 'Prologue'
}

function prefetchFonts() {
    // 用户明确开启省流量模式时不消耗额外带宽。这个标记也保证函数第一次执行
    // 之后再次调用不会重复工作。
    if (prefetched || (navigator as NavigatorWithConnection).connection?.saveData) return
    prefetched = true

    const active = currentSection()
    // 当前区域由 CSS 和 Font Loading API 加载。这里只预热其他分页区域；Timeline
    // 没有自定义字体所以不在 manifest 中，Header 也不是分页区域。
    const fonts = Object.entries(studioFontManifest)
        .filter(([section]) => section !== active)
        .flatMap(([, entries]) => entries as readonly FontEntry[])

    // 这里故意一次性遍历并插入所有 link，而不是等待上一个请求完成后
    // 再插入下一个。字体文件通常很小，串行方式会把每个请求的 RTT
    // 叠加起来；并行方式可以复用已有连接并同时下载。
    for (const { url } of fonts) {
        // 同一个 URL 可能因为重复调度或后续 manifest 变化而再次出现，避免插入
        // 重复的 preload 请求。
        if (document.querySelector(`link[data-studio-font="${url}"]`)) continue
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'font'
        link.type = 'font/woff2'
        // 字体请求需要 CORS 模式。这个属性还必须与 @font-face 的请求
        // 方式一致，否则 preload 的响应可能无法被后续字体请求复用。
        link.crossOrigin = 'anonymous'
        // 预取是后台工作，不能和当前页的 HTML、图片、当前字体竞争最高
        // 优先级。它仍然可能被浏览器延后或忽略，这是低优先级预取的正常行为。
        link.setAttribute('fetchpriority', 'low')
        link.dataset.studioFont = url
        link.href = url
        document.head.appendChild(link)
    }
}

export function scheduleStudioFontPrefetch() {
    // 这个模块由共享的分页器导入，因此要明确限制副作用只发生在 studio 页面。
    if (typeof window === 'undefined') return
    if (!document.documentElement.classList.contains('studio-page')) return

    const run = () => {
        // 空闲调度可以让后台字体请求避开首次渲染。不支持该 API 的浏览器使用
        // timeout 作为回退。
        if ('requestIdleCallback' in window) {
            ;(window as Window & { requestIdleCallback: (callback: () => void, options?: { timeout: number }) => number })
                .requestIdleCallback(prefetchFonts, { timeout: 1500 })
        } else {
            // 老浏览器没有 requestIdleCallback 时，延迟一小段时间再开始，
            // 让首屏布局和当前区域的关键请求先获得调度机会。
            setTimeout(prefetchFonts, 300)
        }
    }
    window.setTimeout(run, 0)
}
