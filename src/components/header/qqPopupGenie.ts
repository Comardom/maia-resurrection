import { gsap } from 'gsap'

const SLICE_COUNT = 5
const SKEW = [6, 3, 0, -3, -6]
const LONG_PRESS_MS = 500

export function initQqPopupGenie() {
    const tile = document.querySelector<HTMLElement>('.tile--qq')
    const popup = document.querySelector<HTMLElement>('.qq-popup')
    const glass = document.querySelector<HTMLElement>('.qq-popup__glass')
    const slices = Array.from(document.querySelectorAll<HTMLElement>('.qq-popup__slice'))
    if (!tile || !popup || !glass || slices.length !== SLICE_COUNT) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let open = false
    let closeTimer = 0
    const tl = gsap.timeline({ paused: true })

    const build = () => {
        tl.clear()
        const tr = tile.getBoundingClientRect()
        const pr = popup.getBoundingClientRect()
        const dx = tr.left + tr.width / 2 - (pr.left + pr.width / 2)
        const dy = tr.top + tr.height / 2 - (pr.top + pr.height / 2)
        tl.set(popup, { autoAlpha: 1 })
            .fromTo(
                glass,
                { x: dx, y: dy, scale: 0.12, transformOrigin: '50% 50%' },
                { x: 0, y: 0, scale: 1, duration: 0.85, ease: 'back.out(1.6)' },
                0,
            )
            .fromTo(
                slices,
                { scaleY: 0.12, skewX: (i: number) => SKEW[i] },
                { scaleY: 1, skewX: 0, duration: 0.85, stagger: 0.025, ease: 'power3.out' },
                0,
            )
        tl.eventCallback('onReverseComplete', () => {
            gsap.set(popup, { autoAlpha: 0 })
        })
    }

    const openPopup = () => {
        if (reduced) {
            popup.style.visibility = 'visible'
            popup.style.opacity = '1'
            return
        }
        if (open) return
        open = true
        clearTimeout(closeTimer)
        build()
        tl.timeScale(1).play()
    }

    const closePopup = () => {
        if (reduced) {
            popup.style.visibility = 'hidden'
            popup.style.opacity = '0'
            return
        }
        if (!open) return
        open = false
        clearTimeout(closeTimer)
        tl.timeScale(1.5).reverse()
    }

    const scheduleClose = () => {
        clearTimeout(closeTimer)
        closeTimer = window.setTimeout(closePopup, 150)
    }

    const menu = document.getElementById('app-menu')
    if (menu) {
        const obs = new MutationObserver(() => {
            if (menu.hasAttribute('inert')) closePopup()
        })
        obs.observe(menu, { attributes: true, attributeFilter: ['inert'] })
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePopup()
    })

    window.addEventListener('resize', () => {
        if (!reduced && open) {
            build()
            tl.timeScale(1).play(0)
        }
    })

    // ── 交互：桌面/外接鼠标悬停 与 触摸长按 ──
    let pressTimer = 0
    let pressX = 0
    let pressY = 0
    let longPressed = false
    let touchGesture = false
    let outside = true

    const isInside = (e: { clientX: number; clientY: number }, el: HTMLElement) => {
        const r = el.getBoundingClientRect()
        return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
    }

    const cancelPress = () => {
        clearTimeout(pressTimer)
        pressTimer = 0
    }

    // 桌面 / 外接鼠标：悬停即开（触摸不会经过 pointerenter）
    tile.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse') {
            touchGesture = false
            outside = false
            openPopup()
        }
    })

    // 触摸 / 手写笔：长按打开；touchstart preventDefault 压制浏览器原生长按菜单
    const startPress = (x: number, y: number) => {
        pressX = x
        pressY = y
        longPressed = false
        cancelPress()
        pressTimer = window.setTimeout(() => {
            pressTimer = 0
            longPressed = true
            openPopup()
        }, LONG_PRESS_MS)
    }

    tile.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return
        touchGesture = true
        e.preventDefault()
        startPress(e.touches[0].clientX, e.touches[0].clientY)
    }, { passive: false })

    tile.addEventListener('touchmove', (e) => {
        if (!pressTimer || e.touches.length !== 1) return
        const t = e.touches[0]
        if (Math.abs(t.clientX - pressX) > 10 || Math.abs(t.clientY - pressY) > 10) {
            cancelPress()
        }
    }, { passive: true })

    tile.addEventListener('touchend', () => {
        cancelPress()
        if (longPressed) {
            longPressed = false
            return
        }
        if (open) {
            closePopup()
            return
        }
        const href = tile.getAttribute('href')
        if (href) window.open(href, '_blank', 'noopener')
    })

    tile.addEventListener('touchcancel', () => {
        cancelPress()
        longPressed = false
    })

    // 长按菜单仅对触摸抑制；桌面右键菜单保留
    tile.addEventListener('contextmenu', (e) => {
        if (touchGesture) e.preventDefault()
    })

    // 键盘：焦点进入打开，移出关闭（纯触屏设备无键盘，跳过以免误开）
    if (!window.matchMedia('(hover: none)').matches) {
        tile.addEventListener('focusin', openPopup)
        tile.addEventListener('focusout', () => {
            if (!reduced) scheduleClose()
        })
    }

    // 鼠标保持打开：指针在 方块/玻璃 内不关，移出 150ms 后关
    document.addEventListener('pointermove', (e) => {
        if (reduced || e.pointerType !== 'mouse' || !open) return
        if (isInside(e, tile) || isInside(e, glass)) {
            outside = false
            clearTimeout(closeTimer)
        } else if (!outside) {
            outside = true
            scheduleClose()
        }
    })

    document.documentElement.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'mouse' && open) scheduleClose()
    })

    // 触摸：点玻璃块关闭
    glass.addEventListener('click', (e) => {
        e.stopPropagation()
        if (touchGesture) closePopup()
    })

    // 触摸：点屏幕任意处关闭
    document.addEventListener('click', () => {
        if (touchGesture && open) closePopup()
    })
}