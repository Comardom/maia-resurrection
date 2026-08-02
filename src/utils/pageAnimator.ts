import { gsap } from 'gsap'
import { Observer } from 'gsap/Observer'

let currentIndex = 0
let isAnimating = false
let sections: HTMLElement[] = []

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

export function initPageAnimator() {
  gsap.registerPlugin(Observer)
  sections = gsap.utils.toArray('.snap-section')
  if (!sections.length) return

  // 初始状态：按 URL hash 定位当前屏，其余隐藏
  currentIndex = sectionIndexFromHash()
  sections.forEach((el) => {
    gsap.set(el, { yPercent: 0, autoAlpha: 0, pointerEvents: 'none' })
  })
  gsap.set(sections[currentIndex], { autoAlpha: 1, zIndex: 1, pointerEvents: 'auto' })

  // 进入页面即把当前屏写入地址栏 hash（如 /studio → /studio#Prologue）
  syncHash(currentIndex)

  // 首屏入场动画：仅在首页（无 hash 或 #Prologue）播放
  // 注意：不动 .logo（深浅切换完全交给 CSS class，避免 gsap 内联 opacity 干扰）
  if (currentIndex === 0) {
    const tl = gsap.timeline()
    tl.from('.title-text', {
      y: -30, opacity: 0, duration: 1, ease: 'power3.out',
    })
    tl.from(
      sections[0].querySelector('.fullscreen-photo'),
      { opacity: 0, scale: 1.05, duration: 1.2, ease: 'power3.out' },
      '-=0.5'
    )
  }

  // 支持浏览器前进/后退与手动改 hash
  window.addEventListener('hashchange', () => {
    goTo(sectionIndexFromHash())
  })

  Observer.create({
    type: 'wheel,touch,pointer',
    wheelSpeed: -1,
    onUp: () => goTo(currentIndex + 1),
    onDown: () => goTo(currentIndex - 1),
    tolerance: 10,
    preventDefault: true,
  })
}

function goTo(index: number) {
  if (isAnimating || index < 0 || index >= sections.length || index === currentIndex) return
  isAnimating = true

  const direction = index > currentIndex ? 1 : -1
  const outgoing = sections[currentIndex]
  const incoming = sections[index]

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.set(outgoing, { autoAlpha: 0, zIndex: 0, pointerEvents: 'none' })
      gsap.set(incoming, { yPercent: 0, zIndex: 1, pointerEvents: 'auto' })
      isAnimating = false
      currentIndex = index
      syncHash(index)
    },
    defaults: { duration: 1.2, ease: 'power4.inOut' },
  })

  // incoming 滑入起点 + 置顶
  gsap.set(incoming, { yPercent: 100 * direction, autoAlpha: 1, zIndex: 2, pointerEvents: 'none' })

  // 旧屏滑出，新屏同时滑入（交叠过渡）
  tl.to(outgoing, { yPercent: -100 * direction })
  tl.to(incoming, { yPercent: 0 }, '<')
}
