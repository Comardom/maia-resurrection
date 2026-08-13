import { timelineEvents } from '@/data/timeline'

// ============================================================
// 「部门大事」播放器逻辑
// 轮播：默认进入本页从头开始，每条固定时长；到末尾停止（按钮回三角）
// 暂停/播放：切换图标 + 进度暂停；划出页面保存进度，回来继续
// 列表：点击切换；当前项展开显示描述；高光进度条
// 图片：无图 fallback 到 logo（黑/白跟随主题），切换淡入
// ============================================================

const DURATION = 5000 // 每条播放时长（ms）

let index = 0
let playing = false
let elapsed = 0 // 当前条已播时间
let saved = false // 是否保存过进度（第二次进入从保存处继续）
let lastTs = 0
let inView = false
let initialized = false

function isDark() {
  return document.documentElement.classList.contains('dark')
}

export function initTimelinePlayer() {
  if (typeof window === 'undefined') return

  const stageEl = document.getElementById('stage-image') as HTMLImageElement | null
  const listEl = document.getElementById('event-list')
  const btnPrev = document.getElementById('ctrl-prev')
  const btnPlay = document.getElementById('ctrl-play')
  const btnNext = document.getElementById('ctrl-next')
  if (!stageEl || !listEl) return
  const stage: HTMLImageElement = stageEl
  const list: HTMLElement = listEl

  const items = Array.from(list.querySelectorAll<HTMLElement>('li'))

  // 标题溢出检测：超宽则加 marquee 自动滚动
  function initMarquee() {
    items.forEach((li) => {
      const title = li.querySelector<HTMLElement>('.event-title')
      if (!title) return
      const overflow = title.scrollWidth - title.clientWidth
      if (overflow > 0) {
        title.classList.add('marquee')
        title.style.setProperty('--title-overflow', `${overflow}px`)
        // 时长随溢出量微调，长的滚得快一点
        title.style.setProperty('--title-duration', `${Math.max(4, Math.round(overflow / 40))}s`)
      } else {
        title.classList.remove('marquee')
        title.style.removeProperty('--title-overflow')
        title.style.removeProperty('--title-duration')
      }
    })
  }

  window.addEventListener('resize', initMarquee)

  function logoFallback() {
    return isDark() ? '/wswd-white.svg' : '/wswd-black.svg'
  }

  function setStageImage(ev: (typeof timelineEvents)[number]) {
    // 淡出 → 换图 → 淡入；有 dark 版本时按主题选图
    stage.classList.remove('visible')
    setTimeout(() => {
      if (ev.image) {
        stage.src = ev.image.dark && isDark() ? ev.image.dark : ev.image.src
        stage.alt = ev.image.alt
      } else {
        stage.src = logoFallback()
        stage.alt = ev.title
      }
      stage.classList.add('visible')
    }, 200)
  }

  // 主题切换：当前事件无图时刷新 logo；有 dark 版本图时切换黑白图
  const themeObserver = new MutationObserver(() => {
    const ev = timelineEvents[index]
    if (ev.image?.dark) {
      stage.classList.remove('visible')
      setTimeout(() => {
        stage.src = isDark() ? ev.image!.dark! : ev.image!.src!
        stage.classList.add('visible')
      }, 150)
    } else if (!ev.image) {
      stage.classList.remove('visible')
      setTimeout(() => {
        stage.src = logoFallback()
        stage.classList.add('visible')
      }, 150)
    }
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  function setActive(nextIndex: number) {
    // 并行执行：旧项收起 + 新项展开（先测量描述高度）
    items.forEach((li, i) => {
      if (i === nextIndex) {
        const desc = li.querySelector<HTMLElement>('.event-desc')
        if (desc) {
          desc.style.setProperty('--desc-h', `${desc.scrollHeight}px`)
        }
        li.classList.add('active')
      } else {
        li.classList.remove('active')
      }
    })
    // 滚动跟随：动画期间（约 0.6s）每帧直接赋值 scrollTop，
    // 与展开/收起布局变化同步，无平滑插值冲突、无跳变
    let frame = 0
    ;(function follow() {
      scrollToActive()
      if (++frame < 40) requestAnimationFrame(follow)
    })()
  }

  function scrollToActive() {
    const active = items[index]
    if (!active) return
    const target = active.offsetTop - list.clientHeight / 2 + active.clientHeight / 2
    // 底部留 0.75rem 余量，确保最后一条（含 padding）完整露出
    const maxScroll = Math.max(0, list.scrollHeight - list.clientHeight - 12)
    const clamped = Math.max(0, Math.min(target, maxScroll))
    list.scrollTop = clamped
  }

  function updateProgress() {
    // 清空所有条目的高光层，只保留当前项（从左往右覆盖整卡）
    items.forEach((li, i) => {
      const bar = li.querySelector<HTMLElement>('.event-progress')
      if (bar) bar.style.inlineSize = i === index ? `${Math.min(100, (elapsed / DURATION) * 100)}%` : '0%'
    })
    // 移动端分割线进度高光
    const stageProgress = document.getElementById('stage-progress')
    if (stageProgress) {
      stageProgress.style.inlineSize = `${Math.min(100, (elapsed / DURATION) * 100)}%`
    }
  }

  function setPlaying(p: boolean) {
    playing = p
    btnPlay?.classList.toggle('is-playing', p)
    btnPlay?.setAttribute('aria-label', p ? '暂停' : '播放')
  }

  function goto(i: number) {
    const len = timelineEvents.length
    // 循环播放：越界回绕
    const next = ((i % len) + len) % len
    index = next
    elapsed = 0
    const ev = timelineEvents[next]
    setStageImage(ev)
    // 同步移动端标题/描述
    const title = document.getElementById('stage-title')
    const desc = document.getElementById('stage-desc')
    if (title) title.textContent = `${ev.year} · ${ev.title}`
    if (desc) desc.textContent = ev.description
    setActive(next)
    updateProgress()
  }

  function tick(t: number) {
    if (!playing || !inView) return
    if (!lastTs) lastTs = t
    const dt = t - lastTs
    lastTs = t
    elapsed += dt
    updateProgress()
    if (elapsed >= DURATION) {
      // 循环播放：到最后一条后回到第一条
      goto(index + 1)
    }
  }

  function loop(t: number) {
    requestAnimationFrame(loop)
    tick(t)
  }

  // 按钮事件（循环：越界回绕）
  btnPrev?.addEventListener('click', () => {
    goto(index - 1)
  })
  btnNext?.addEventListener('click', () => {
    goto(index + 1)
  })
  btnPlay?.addEventListener('click', () => {
    if (playing) {
      setPlaying(false)
    } else {
      // 已播完暂停后点击：从头开始播放；中途暂停则继续
      if (elapsed >= DURATION) goto(0)
      setPlaying(true)
      lastTs = 0
    }
  })

  // 列表点击：切换对应事件
  items.forEach((li, i) => {
    li.addEventListener('click', () => {
      goto(i)
      if (!playing) setPlaying(true)
      lastTs = 0
    })
  })

  // 进入/离开本页：保存进度，回来继续
  window.addEventListener('section:change', (e) => {
    const id = (e as CustomEvent).detail?.id
    if (id === 'Timeline') {
      inView = true
      // 尊重减少动画偏好：不自动播放（用户手动点播放）
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!initialized) {
        initialized = true
        goto(0)
        if (!reduce) setPlaying(true)
      } else if (saved) {
        // 再次进入：从保存进度继续（reduced-motion 下保持暂停）
        lastTs = 0
        if (!reduce) setPlaying(true)
      }
    } else {
      inView = false
      // 离开：暂停 + 保存进度（划出页面也要保存）
      saved = true
      setPlaying(false)
    }
  })

  // 初始渲染第一项（列表高亮 + 图）
  goto(0)
  requestAnimationFrame(loop)
  // 等列表布局稳定后检测标题溢出
  requestAnimationFrame(() => initMarquee())
  setTimeout(initMarquee, 300)
}
