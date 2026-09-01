import { gsap } from 'gsap'
import { Observer } from 'gsap/Observer'
import { closeAppMenu } from '@/components/header/headerScript'
import { scheduleStudioFontPrefetch } from '@/utils/studioFontPrefetch'
import { studioFontManifest } from '@/data/generated/studioFontManifest'

let currentIndex = 0
let isAnimating = false
let sections: HTMLElement[] = []
let reducedMotion = false
let navLocked = false

export function lockNavigation(locked: boolean) {
    navLocked = locked
}

function sectionIndexFromHash(): number {
    const id = window.location.hash.replace('#', '')
    if (!id) return 0
    const idx = sections.findIndex((el) => el.id === id)
    return idx >= 0 ? idx : 0
}

function syncHash(index: number) {
    const id = sections[index]?.id
    if (id) {
        window.history.replaceState(null, '', `#${id}`)
    }
}

function dispatchSectionChange(index: number) {
    const id = sections[index]?.id
    window.dispatchEvent(new CustomEvent('section:change', {
        detail: { index, id },
    }))
}

function setActiveSection(index: number) {
    sections.forEach((section, sectionIndex) => {
        section.classList.toggle('is-active', sectionIndex === index)
    })
}

function setEnteringSection(index: number | null) {
    sections.forEach((section, sectionIndex) => {
        section.classList.toggle('is-entering', sectionIndex === index)
    })
}

function prepareSectionFonts(index: number) {
    // CSS 中的 @font-face 声明是唯一的字体来源。这里调用 fonts.load 只是提前
    // 加载即将显示区域的 alias，不会注册第二套 FontFace，也不会替换 CSS family。
    const id = sections[index]?.id as keyof typeof studioFontManifest | undefined
    if (!id || !(id in studioFontManifest)) return
    for (const { alias, sample } of studioFontManifest[id]) {
        document.fonts.load(`1em "${alias}"`, sample).catch(() => undefined)
    }
}

export function initPageAnimator() {
    gsap.registerPlugin(Observer)
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    sections = gsap.utils.toArray('.snap-section')
    if (!sections.length) return

    // 初始状态：按 URL hash 定位当前屏，其余隐藏
    currentIndex = sectionIndexFromHash()
    setActiveSection(currentIndex)
    sections.forEach((el) => {
        gsap.set(el, { yPercent: 0, autoAlpha: 0, pointerEvents: 'none' })
    })
    gsap.set(sections[currentIndex], { autoAlpha: 1, zIndex: 1, pointerEvents: 'auto' })

    // 进入页面即把当前屏写入地址栏 hash（如 /studio → /studio#Prologue）
    syncHash(currentIndex)

    // 广播当前屏，供各区块（如 Symphony）按需启停自身动画
    dispatchSectionChange(currentIndex)
    prepareSectionFonts(currentIndex)
    scheduleStudioFontPrefetch()

    // 首屏入场动画：仅在首页（无 hash 或 #Prologue）播放，且用户未开启减少动画
    // 注意：不动 .logo（深浅切换完全交给 CSS class，避免 gsap 内联 opacity 干扰）
    if (currentIndex === 0 && !reducedMotion) {
        const tl = gsap.timeline()
        tl.from('.title-text', {
            y: -30, opacity: 0, duration: 1, ease: 'power3.out',
        })
        const hero = sections[0].querySelector('.fullscreen-photo')
        if (hero) {
            tl.from(
                hero,
                { scale: 1.08, duration: 1.2, ease: 'power3.out' },
                '-=0.5'
            )
        }
    }

    // 支持浏览器前进/后退与手动改 hash
    window.addEventListener('hashchange', () => {
        goTo(sectionIndexFromHash())
    })

    Observer.create({
        type: 'wheel,touch',
        wheelSpeed: -1,
        onUp: () => goTo(currentIndex + 1),
        onDown: () => goTo(currentIndex - 1),
        tolerance: 10,
        preventDefault: true,
    })

    // 键盘翻页：PageDown/PageUp（不占用方向键，避免干扰 Tab 焦点移动）
    document.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'PageDown') {
            e.preventDefault()
            goTo(currentIndex + 1)
        } else if (e.key === 'PageUp') {
            e.preventDefault()
            goTo(currentIndex - 1)
        }
    })
}

function goTo(index: number) {
    if (navLocked || isAnimating || index < 0 || index >= sections.length || index === currentIndex) return
    isAnimating = true
    closeAppMenu()

    const direction = index > currentIndex ? 1 : -1
    const outgoing = sections[currentIndex]
    const incoming = sections[index]
    // 在过渡结束前保留旧区域的 active 状态，避免旧区域仍然可见时就失去自己的
    // font-family，造成明显的字体闪烁。
    setEnteringSection(index)
    currentIndex = index
    syncHash(index)
    dispatchSectionChange(index)
    prepareSectionFonts(index)

    const tl = gsap.timeline({
        onComplete: () => {
            gsap.set(outgoing, { autoAlpha: 0, zIndex: 0, pointerEvents: 'none' })
            gsap.set(incoming, { yPercent: 0, zIndex: 1, pointerEvents: 'auto' })
            outgoing.classList.remove('is-active')
            setEnteringSection(null)
            incoming.classList.add('is-active')
            isAnimating = false
        },
        defaults: { duration: reducedMotion ? 0 : 1.2, ease: 'power4.inOut' },
    })

    // incoming 滑入起点 + 置顶
    gsap.set(incoming, { yPercent: 100 * direction, autoAlpha: 1, zIndex: 2, pointerEvents: 'none' })

    // 旧屏滑出，新屏同时滑入（交叠过渡）
    tl.to(outgoing, { yPercent: -100 * direction })
    tl.to(incoming, { yPercent: 0 }, '<')
}
