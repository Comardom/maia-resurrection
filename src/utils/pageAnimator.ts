import { gsap } from 'gsap'
import { Observer } from 'gsap/Observer'

let currentIndex = 0
let isAnimating = false
let sections: HTMLElement[] = []

export function initPageAnimator() {
  gsap.registerPlugin(Observer)
  sections = gsap.utils.toArray('.snap-section')
  if (!sections.length) return

  // 初始状态：全隐藏，只显示第一个
  sections.forEach((el) => {
    gsap.set(el, { opacity: 0, pointerEvents: 'none' })
  })
  gsap.set(sections[0], { opacity: 1, pointerEvents: 'auto' })

  Observer.create({
    type: 'wheel,touch,pointer',
    onUp: () => goTo(currentIndex + 1),
    onDown: () => goTo(currentIndex - 1),
    tolerance: 10,
    preventDefault: true,
  })
}

function goTo(index: number) {
  if (isAnimating || index < 0 || index >= sections.length) return
  isAnimating = true

  const outgoing = sections[currentIndex]
  const incoming = sections[index]

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.set(outgoing, { pointerEvents: 'none' })
      isAnimating = false
      currentIndex = index
    },
  })

  tl.to(outgoing, {
    opacity: 0,
    scale: 0.95,
    duration: 0.6,
    ease: 'power2.inOut',
  })
  tl.fromTo(
    incoming,
    { opacity: 0, scale: 1.05, pointerEvents: 'none' },
    {
      opacity: 1,
      scale: 1,
      pointerEvents: 'auto',
      duration: 0.6,
      ease: 'power2.out',
    },
    '-=0.3'
  )
}