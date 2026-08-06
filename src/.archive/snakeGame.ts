import { fitCanvas, calcGrid } from './engine.ts'

// 正式贪吃蛇：全屏 overlay 内，经典方块蛇

const COLS = 24
const BEST_KEY = 'snakeBest'
const BASE_TICK_MS = 210 // 初始每格间隔
const MIN_TICK_MS = 110 // 最快
const SPEEDUP_EVERY = 10 // 每吃 10 个加速

type Vec = { x: number; y: number }
type Phase = 'playing' | 'paused' | 'over'

const DIRS: Record<string, Vec> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
  W: { x: 0, y: -1 },
  S: { x: 0, y: 1 },
  A: { x: -1, y: 0 },
  D: { x: 1, y: 0 },
}

export function startSnakeGame(container: HTMLElement) {
  const canvas = document.createElement('canvas')
  canvas.id = 'game-canvas'
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;display:block;'
  container.appendChild(canvas)

  let raf = 0
  let running = false
  let ctx: CanvasRenderingContext2D
  let cell = 1
  let originX = 0
  let originY = 0
  let cols = COLS
  let rows = 1

  let snake: Vec[] = []
  let dir: Vec = { x: 1, y: 0 }
  let nextDir: Vec = { x: 1, y: 0 }
  let food: Vec | null = null
  let score = 0
  let best = 0
  let phase: Phase = 'playing'
  let last = 0
  let acc = 0
  let eaten = 0

  const exitBtn = document.getElementById('game-exit')

  function isDark() {
    return document.documentElement.classList.contains('dark')
  }

  function setExitVisible(visible: boolean) {
    if (!exitBtn) return
    exitBtn.style.opacity = visible ? '1' : '0'
    exitBtn.style.pointerEvents = visible ? 'auto' : 'none'
  }

  function loadBest() {
    try {
      best = parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0
    } catch {
      best = 0
    }
  }

  function saveBest() {
    try {
      localStorage.setItem(BEST_KEY, String(best))
    } catch {
      /* ignore */
    }
  }

  function tickMs() {
    const steps = Math.floor(eaten / SPEEDUP_EVERY)
    return Math.max(MIN_TICK_MS, BASE_TICK_MS - steps * 10)
  }

  function spawnFood() {
    const free = []
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (!snake.some((s) => s.x === x && s.y === y)) free.push({ x, y })
      }
    }
    food = free.length ? free[Math.floor(Math.random() * free.length)] : null
  }

  function reset() {
    snake = []
    const cy = Math.floor(rows / 2)
    for (let i = 0; i < 3; i++) snake.push({ x: Math.floor(cols / 2) - 1 - i, y: cy })
    dir = { x: 1, y: 0 }
    nextDir = { x: 1, y: 0 }
    score = 0
    eaten = 0
    phase = 'playing'
    spawnFood()
    setExitVisible(false)
  }

  function hitWall(v: Vec) {
    return v.x < 0 || v.y < 0 || v.x >= cols || v.y >= rows
  }

  function hitSelf(v: Vec) {
    return snake.some((s) => s.x === v.x && s.y === v.y)
  }

  function advance() {
    dir = nextDir
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }
    if (hitWall(head) || hitSelf(head)) {
      phase = 'over'
      setExitVisible(true)
      if (score > best) {
        best = score
        saveBest()
      }
      return
    }
    snake.unshift(head)
    if (food && head.x === food.x && head.y === food.y) {
      score++
      eaten++
      spawnFood()
    } else {
      snake.pop()
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
    // 画布底色跟随主题：浅色用浅底、深色用深底
    const dark = isDark()
    ctx.fillStyle = dark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.6)'
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)

    // 蛇身
    ctx.fillStyle = '#3b82f6'
    for (let i = 0; i < snake.length; i++) {
      const s = snake[i]
      ctx.fillRect(originX + s.x * cell, originY + s.y * cell, cell, cell)
    }
    // 蛇头
    if (snake.length) {
      const h = snake[0]
      ctx.fillStyle = '#fff'
      ctx.fillRect(originX + h.x * cell, originY + h.y * cell, cell, cell)
    }
    // 食物
    if (food) {
      ctx.fillStyle = '#ff3b30'
      ctx.fillRect(originX + food.x * cell, originY + food.y * cell, cell, cell)
    }

    // 文字层（颜色跟随主题）
    const textColor = dark ? '#fff' : '#222'
    ctx.font = '600 1rem "Huiwei-HKHei", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillStyle = textColor
    ctx.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)'
    ctx.shadowBlur = 4
    ctx.fillText(`得分 ${score}    最高 ${best}`, canvas.clientWidth / 2, 12)
    ctx.shadowBlur = 0

    if (phase === 'paused') {
      ctx.font = '700 1.5rem "Huiwei-HKHei", sans-serif'
      ctx.fillStyle = textColor
      ctx.fillText('已暂停 — 空格继续', canvas.clientWidth / 2, canvas.clientHeight / 2 - 10)
    } else if (phase === 'over') {
      ctx.fillStyle = dark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.7)'
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)
      ctx.fillStyle = textColor
      ctx.font = '700 2rem "Huiwei-HKHei", sans-serif'
      ctx.textBaseline = 'middle'
      ctx.fillText('游戏结束', canvas.clientWidth / 2, canvas.clientHeight / 2 - 40)
      ctx.font = '500 1.2rem "Huiwei-HKHei", sans-serif'
      ctx.fillText(`得分 ${score}    最高 ${best}`, canvas.clientWidth / 2, canvas.clientHeight / 2 + 6)
      ctx.fillText('按 R 重玩 · 按 Esc 返回', canvas.clientWidth / 2, canvas.clientHeight / 2 + 40)
    }
  }

  function frame(t: number) {
    if (!running) return
    raf = requestAnimationFrame(frame)
    if (!last) last = t
    acc += t - last
    last = t
    if (phase === 'playing' && acc >= tickMs()) {
      acc = 0
      advance()
    }
    draw()
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault()
      if (phase === 'playing') phase = 'paused'
      else if (phase === 'paused') phase = 'playing'
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      exitBtn?.click()
      return
    }
    if (e.key.toLowerCase() === 'r') {
      if (phase === 'over') {
        reset()
        acc = 0
      }
      return
    }
    const d = DIRS[e.key]
    if (!d) return
    e.preventDefault()
    if (phase !== 'playing') return
    // 禁止 180° 掉头
    if (dir.x + d.x === 0 && dir.y + d.y === 0) return
    nextDir = d
  }

  function setup() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    ctx = fitCanvas(canvas)
    const grid = calcGrid(w, h, COLS)
    cols = grid.cols
    rows = grid.rows
    cell = grid.cell
    originX = grid.originX
    originY = grid.originY
    reset()
    last = 0
    acc = 0
  }

  loadBest()
  setup()
  running = true
  raf = requestAnimationFrame(frame)
  window.addEventListener('keydown', onKey)
  const ro = new ResizeObserver(() => {
    ctx = fitCanvas(canvas)
    const grid = calcGrid(canvas.clientWidth, canvas.clientHeight, COLS)
    cols = grid.cols
    rows = grid.rows
    cell = grid.cell
    originX = grid.originX
    originY = grid.originY
    if (snake.length) {
      // 简单处理：格子变了就重置位置边界内的蛇
      snake = snake.filter((s) => s.x < cols && s.y < rows)
      if (!snake.length) reset()
    }
  })
  ro.observe(container)

  return {
    destroy() {
      running = false
      if (raf) cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('keydown', onKey)
      canvas.remove()
    },
  }
}
