import { gsap } from 'gsap'

const SLICE_COUNT = 5
const SKEW = [6, 3, 0, -3, -6]

export function initQqPopupGenie() {
  const tile = document.querySelector<HTMLElement>('.tile--qq')
  const popup = document.querySelector<HTMLElement>('.qq-popup')
  const glass = document.querySelector<HTMLElement>('.qq-popup__glass')
  const slices = Array.from(document.querySelectorAll<HTMLElement>('.qq-popup__slice'))
  if (!tile || !popup || !glass || slices.length !== SLICE_COUNT) return
  if (window.matchMedia('(hover: none)').matches) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduced) {
    tile.addEventListener('mouseenter', () => {
      popup.style.visibility = 'visible'
      popup.style.opacity = '1'
    })
    tile.addEventListener('mouseleave', () => {
      popup.style.visibility = 'hidden'
      popup.style.opacity = '0'
    })
    return
  }

  let open = false
  let closeTimer = 0
  let outside = true
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

  const openGenie = () => {
    if (open) return
    open = true
    outside = false
    clearTimeout(closeTimer)
    build()
    tl.timeScale(1).play()
  }

  const closeGenie = () => {
    if (!open) return
    open = false
    clearTimeout(closeTimer)
    tl.timeScale(1.5).reverse()
  }

  const scheduleClose = () => {
    clearTimeout(closeTimer)
    closeTimer = window.setTimeout(closeGenie, 150)
  }

  const isInside = (e: MouseEvent, el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
  }

  tile.addEventListener('mouseenter', openGenie)
  tile.addEventListener('mouseleave', () => {
    outside = true
    scheduleClose()
  })
  tile.addEventListener('focusin', openGenie)
  tile.addEventListener('focusout', scheduleClose)

  document.addEventListener('mousemove', (e) => {
    if (!open) return
    if (isInside(e, tile) || isInside(e, glass)) {
      outside = false
      clearTimeout(closeTimer)
    } else if (!outside) {
      outside = true
      scheduleClose()
    }
  })

  document.documentElement.addEventListener('mouseleave', () => {
    if (open) scheduleClose()
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeGenie()
  })

  const menu = document.getElementById('app-menu')
  if (menu) {
    const obs = new MutationObserver(() => {
      if (menu.hasAttribute('inert')) closeGenie()
    })
    obs.observe(menu, { attributes: true, attributeFilter: ['inert'] })
  }

  window.addEventListener('resize', () => {
    if (open) {
      build()
      tl.timeScale(1).play(0)
    }
  })
}