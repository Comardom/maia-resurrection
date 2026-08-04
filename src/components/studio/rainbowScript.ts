import { gsap } from 'gsap'

let started = false
const heights = new Map<HTMLElement, number>()

function drift(el: HTMLElement) {
    const current = heights.get(el) ?? 50
    // 在 ±24 范围内随机漂移，并夹在 [20, 100]
    const delta = Math.random() * 48 - 24
    const target = Math.min(100, Math.max(20, current + delta))
    gsap.to(el, {
        '--band-height': `${target}%`,
        duration: 2 + Math.random() * 2,
        ease: 'sine.inOut',
        onComplete: () => drift(el),
    })
    heights.set(el, target)
}

function start(bands: HTMLElement[]) {
    if (started) return
    started = true
    bands.forEach((el) => {
        // 起步值：读内联 --band-height，避免 getComputedStyle
        const v = parseFloat(el.style.getPropertyValue('--band-height')) || 50
        heights.set(el, v)
        drift(el)
    })
}

function stop() {
    if (!started) return
    started = false
    gsap.killTweensOf('.rainbow-band:not(.band-red)')
    heights.clear()
}

export function initRainbowIdle() {
    if (typeof window === 'undefined') return
    // 仅桌面端（>48rem）启动
    if (window.matchMedia('(max-width: 48rem)').matches) return
    // 尊重系统减少动画偏好
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const bands = gsap.utils.toArray<HTMLElement>('.rainbow-band:not(.band-red)')
    if (!bands.length) return

    window.addEventListener('section:change', (e) => {
        const id = (e as CustomEvent).detail?.id
        if (id === 'Symphony') start(bands)
        else stop()
    })
}

/* ── 移动端：手风琴展开/收起（纯 CSS transition，仅切换 class） ── */
export function initRainbowAccordion() {
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(max-width: 48rem)').matches) return

    const bands = Array.from(document.querySelectorAll<HTMLElement>('.rainbow-band:not(.band-red)'))
    if (!bands.length) return

    let expandedEl: HTMLElement | null = null

    bands.forEach((band) => {
        const main = band.querySelector<HTMLElement>('.band-main')
        if (!main) return
        main.addEventListener('click', () => {
            if (expandedEl === band) {
                band.classList.remove('expanded')
                expandedEl = null
            } else {
                expandedEl?.classList.remove('expanded')
                band.classList.add('expanded')
                expandedEl = band
            }
        })
    })

    // 部门页未建前：goto 链接 href="#" 会污染 URL hash 触发翻页，先阻止
    document.querySelectorAll<HTMLAnchorElement>('.band-goto').forEach((a) => {
        if (a.getAttribute('href') === '#') {
            a.addEventListener('click', (e) => e.preventDefault())
        }
    })
}
