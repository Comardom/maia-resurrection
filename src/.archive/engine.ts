// 通用 canvas 工具

/** 读取 canvas 并按设备像素比适配分辨率 */
export function fitCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return ctx
}

/** 计算像素网格：固定列数，行数按宽高比，格子取整数（网格居中） */
export function calcGrid(canvasW: number, canvasH: number, cols: number) {
  const rows = Math.max(1, Math.round((cols * canvasH) / canvasW))
  const cell = Math.floor(Math.min(canvasW / cols, canvasH / rows))
  const gridW = cell * cols
  const gridH = cell * rows
  const originX = Math.floor((canvasW - gridW) / 2)
  const originY = Math.floor((canvasH - gridH) / 2)
  return { rows, cols, cell, originX, originY }
}

/** 获取 CSS 变量值（主题色等） */
export function cssVar(name: string, fallback = ''): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}
