import { gsap } from 'gsap'
import { lockNavigation } from '@/utils/pageAnimator'

let timeline: gsap.core.Timeline | null = null

function isDesktop() {
    return window.matchMedia('(hover: hover)').matches
}

function prefersReduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function initRedTransition() {
    if (typeof window === 'undefined') return
    if (!isDesktop()) return

    const red = document.querySelector<HTMLElement>('.band-red')
    if (!red) return

    red.addEventListener('click', () => {
        if (timeline) return
        enterGame()
    })

    const exitBtn = document.getElementById('game-exit')
    exitBtn?.addEventListener('click', exitGame)
}

/* ── 进入游戏（当前为占位：全屏过渡 + 显示"游戏制作中"） ── */
function enterGame() {
    const rainbow = document.querySelector<HTMLElement>('.rainbow')
    const red = document.querySelector<HTMLElement>('.band-red')
    const bands = Array.from(document.querySelectorAll<HTMLElement>('.rainbow-band:not(.band-red)'))
    const overlay = document.getElementById('game-overlay')
    if (!rainbow || !red || !overlay) return

    lockNavigation(true)
    document.documentElement.classList.add('game-mode')
    // 顶栏向上收起（平滑过渡）
    gsap.to('.top-bar', { yPercent: -110, duration: 0.6, ease: 'power2.inOut' })

    // ① 先在 flex 布局下一次性捕获所有位置（必须在转 absolute 之前）
    const allEls: HTMLElement[] = [red, ...bands]
    const rects = allEls.map((el) => ({
        left: el.offsetLeft,
        top: el.offsetTop,
        width: el.offsetWidth,
        height: el.offsetHeight,
    }))

    // ② 用捕获值同帧转 absolute，避免中间态闪动/错位
    allEls.forEach((el, i) => {
        gsap.set(el, {
            position: 'absolute',
            left: rects[i].left,
            top: rects[i].top,
            width: rects[i].width,
            height: rects[i].height,
            margin: 0,
        })
    })
    rainbow.classList.add('transitioning')
    // 进入动画期间隐藏 Game Start（红色块处于 hover 状态时它本会滑入）
    const gsStart = red.querySelector<HTMLElement>('.game-start')
    if (gsStart) gsap.set(gsStart, { clearProps: 'opacity,transform' })

    if (prefersReduced() || bands.length < 6 || !rects[1]) {
        // 减少动画偏好，或色带数量不足（某部门未渲染）时：走简化满屏接管，避免 rects[i+1] 越界崩溃
        gsap.set(red, { left: 0, top: 0, width: '100%', height: '100%', opacity: 0.2 })
        gsap.set(bands, { x: window.innerWidth })
        showOverlay(overlay)
        return
    }

    const paddingLeft = parseFloat(getComputedStyle(rainbow).paddingInlineStart) || 0

    // 六块重叠：各块向左移动，两两相交 95%（露 5% 左缘）——用捕获的 rects 计算
    const base = rects[1].left
    const w = rects[1].width
    const overlapX = (i: number) => {
        const target = base + i * w * 0.05
        return target - rects[i + 1].left
    }

    const tl = gsap.timeline({ onComplete: () => showOverlay(overlay) })

    // 幕1：红色向左扩（吃掉左侧空隙）+ 遮罩消失 + 六块重叠 95%
    tl.to(red, { left: 0, width: rects[0].width + paddingLeft, duration: 0.6, ease: 'power2.inOut' }, 0)
    bands.forEach((b, i) => {
        tl.to(b, { x: overlapX(i), duration: 0.7, ease: 'power2.inOut' }, 0.1 + i * 0.05)
    })

    // 幕2：六块滑出右屏 + 红色纵向满屏
    tl.to(bands, { x: `+=${window.innerWidth}`, duration: 0.9, ease: 'power3.in' }, 0.9)
    tl.to(red, { top: 0, width: '100%', height: '100%', duration: 0.9, ease: 'power3.inOut' }, 0.9)

    // 幕3：红色降透明（留余韵）
    tl.to(red, { opacity: 0.2, duration: 0.5, ease: 'power2.out' }, 1.9)

    timeline = tl
}

/* ── 显示占位容器（"游戏制作中"） ─────────── */
function showOverlay(overlay: HTMLElement) {
    overlay.style.pointerEvents = 'auto'
    gsap.to(overlay, { opacity: 1, duration: 0.4, ease: 'power2.out' })
    document.getElementById('game-exit')?.focus()
}

/* ── 退出游戏：原路返回 ────────────────── */
function exitGame() {
    const rainbow = document.querySelector<HTMLElement>('.rainbow')
    const overlay = document.getElementById('game-overlay')
    if (!rainbow || !overlay) return

    overlay.style.pointerEvents = 'none'
    gsap.to(overlay, { opacity: 0, duration: 0.4, ease: 'power2.in' })

    if (prefersReduced()) {
        finishReverse()
        return
    }

    // 时间线原路反向
    const tl = timeline
    timeline = null
    if (tl) {
        tl.eventCallback('onReverseComplete', () => finishReverse())
        tl.reverse()
    } else {
        finishReverse()
    }
}

function finishReverse() {
    const rainbow = document.querySelector<HTMLElement>('.rainbow')
    const red = document.querySelector<HTMLElement>('.band-red')
    const bands = Array.from(document.querySelectorAll<HTMLElement>('.rainbow-band:not(.band-red)'))
    if (!rainbow || !red) return

    // 恢复 flex 布局与初始样式
    gsap.set(red, { position: '', left: '', top: '', width: '', height: '', opacity: 1, margin: '' })
    gsap.set(bands, { position: '', left: '', top: '', width: '', height: '', x: 0, margin: '' })
    // 清除 Game Start 的内联样式，彻底交还 CSS 控制：
    // 平时隐藏、hover 显示完全由 .band-red:hover .game-start 决定，
    // 不再用内联 opacity/transform 压制（内联优先级高于样式表，会导致 hover 失效）
    const gs = red.querySelector<HTMLElement>('.game-start')
    if (gs) gsap.set(gs, { clearProps: 'opacity,transform' })
    rainbow.classList.remove('transitioning')
    // 顶栏滑回：必须在 game-mode 仍生效（呼吸动画被停）时播放 gsap，
    // 否则 animation: breathe-y 的 transform 优先级高于 gsap 内联样式，会覆盖动画
    gsap.to('.top-bar', {
        yPercent: 0,
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: () => {
            // 动画播完后再恢复呼吸动画，并清除 gsap 内联 transform
            document.documentElement.classList.remove('game-mode')
            gsap.set('.top-bar', { clearProps: 'transform' })
        },
    })
    lockNavigation(false)
}
