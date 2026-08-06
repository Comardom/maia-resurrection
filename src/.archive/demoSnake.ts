import { fitCanvas, calcGrid, cssVar } from './engine.ts'
import { BODY_WORDS } from './words.ts'

// 演示蛇：红色块内 S 型蛇形扫描，吃掉第一排文字形成文字蛇身，再原路吐回

type Phase = 'eat' | 'return' | 'spit'

const COLS = 16
const TICK_MS = 180 // 每格推进间隔

export function initDemoSnake(container: HTMLElement) {
  const canvas = document.createElement('canvas')
  canvas.className = 'demo-canvas'
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;'
  container.appendChild(canvas)

  let raf = 0
  let running = false
  let ro: ResizeObserver | null = null
  let last = 0
  let acc = 0
  let ctx: CanvasRenderingContext2D
  let cell = 1
  let originX = 0
  let originY = 0
  let cols = COLS
  let rows = 1
  let path: { x: number; y: number }[] = []

  // 状态
  let phase: Phase = 'eat'
  let headIdx = 0 // 蛇头在 path 中的索引
  let headHist: { x: number; y: number }[] = [] // 蛇头走过的格子（用于蛇身跟随后）
  let body: string[] = [] // 当前蛇身文字
  let wordsAt: (string | null)[] = [] // 第一排每格当前文字
  let returnTo = 0

  function buildPath() {
    path = []
    for (let y = 0; y < rows; y++) {
      const xFrom = y % 2 === 0 ? 0 : cols - 1
      const xTo = y % 2 === 0 ? cols - 1 : 0
      const step = y % 2 === 0 ? 1 : -1
      for (let x = xFrom; step > 0 ? x <= xTo : x >= xTo; x += step) {
        path.push({ x, y })
      }
    }
  }

  function setupWords() {
    wordsAt = new Array(cols).fill(null)
    BODY_WORDS.forEach((w, i) => {
      if (i < cols) wordsAt[i] = w
    })
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
    const textColor = cssVar('--theme-color', '#222')

    // 第一排待吃的文字（淡色）
    ctx.font = `${cell * 0.7}px 'Huiwei-HKHei', sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (let x = 0; x < cols; x++) {
      const w = wordsAt[x]
      if (!w) continue
      ctx.globalAlpha = 0.55
      ctx.fillStyle = textColor
      ctx.fillText(w, originX + x * cell + cell / 2, originY + cell / 2)
    }
    ctx.globalAlpha = 1

    // 蛇身文字（跟随蛇头）
    for (let i = 0; i < body.length; i++) {
      const pos = headHist[i + 1]
      if (!pos) continue
      ctx.fillStyle = textColor
      ctx.fillText(body[i], originX + pos.x * cell + cell / 2, originY + pos.y * cell + cell / 2)
    }

    // 蛇头：色块
    const hp = path[headIdx]
    if (hp) {
      ctx.fillStyle = cssVar('--studio-tile', '#007ACC')
      ctx.fillRect(originX + hp.x * cell, originY + hp.y * cell, cell, cell)
    }
  }

  function advance() {
    switch (phase) {
      case 'eat': {
        headIdx++
        headHist.unshift({ ...path[headIdx] })
        headHist = headHist.slice(0, BODY_WORDS.length + 2)
        // 蛇头经过第一排且有文字 → 吃掉
        const cellAt = path[headIdx]
        if (cellAt && cellAt.y === 0 && wordsAt[cellAt.x]) {
          body.push(wordsAt[cellAt.x]!)
          wordsAt[cellAt.x] = null
        }
        // 走完整个 S 型 → 进入 return
        if (headIdx >= path.length - 1) {
          phase = 'return'
          returnTo = 0
        }
        break
      }
      case 'return': {
        // 蛇头沿路径倒退回第一排起点
        if (headIdx > returnTo) {
          headIdx--
          headHist.unshift({ ...path[headIdx] })
          headHist = headHist.slice(0, BODY_WORDS.length + 2)
        } else {
          phase = 'spit'
        }
        break
      }
      case 'spit': {
        headIdx++
        headHist.unshift({ ...path[headIdx] })
        headHist = headHist.slice(0, BODY_WORDS.length + 2)
        // 经过第一排 → 吐回一个文字（从蛇身末尾取）
        const cellAt = path[headIdx]
        if (cellAt && cellAt.y === 0 && body.length) {
          const w = body.pop()!
          wordsAt[cellAt.x] = w
        }
        if (headIdx >= path.length - 1 || !body.length) {
          // 全部吐出 → 重新开始
          phase = 'eat'
          headIdx = 0
          headHist = []
        }
        break
      }
    }
  }

  function frame(t: number) {
    if (!running) return
    raf = requestAnimationFrame(frame)
    if (!last) last = t
    acc += t - last
    last = t
    if (acc >= TICK_MS) {
      acc = 0
      advance()
      draw()
    }
  }

  function setup() {
    const w = container.clientWidth
    const h = container.clientHeight
    if (!w || !h) return
    ctx = fitCanvas(canvas)
    const grid = calcGrid(w, h, COLS)
    cols = grid.cols
    rows = grid.rows
    cell = grid.cell
    originX = grid.originX
    originY = grid.originY
    buildPath()
    setupWords()
    phase = 'eat'
    headIdx = 0
    headHist = []
    body = []
    last = 0
    acc = 0
    draw()
  }

  function resize() {
    setup()
  }

  function start() {
    if (running) return
    running = true
    ro = new ResizeObserver(resize)
    ro.observe(container)
    setup()
    raf = requestAnimationFrame(frame)
  }

  function stop() {
    running = false
    if (raf) cancelAnimationFrame(raf)
    ro?.disconnect()
    ro = null
    ctx?.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
  }

  return { canvas, start, stop }
}

/** 恢复 demo 循环（从初始状态开始） */
export function startDemo(container: HTMLElement): { stop: () => void } {
  const demo = initDemoSnake(container)
  demo.start()
  return { stop: demo.stop }
}
