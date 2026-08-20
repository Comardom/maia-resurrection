type Theme = 'light' | 'dark'

export function currentTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function updateThemeControls(theme: Theme) {
  document.querySelectorAll<HTMLElement>('[data-theme-control]').forEach((control) => {
    const mode = control.dataset.themeControl

    if (mode === 'light' || mode === 'dark') {
      const active = mode === theme
      control.classList.toggle('is-active', active)
      control.setAttribute('aria-pressed', String(active))
    }

    if (mode === 'toggle') {
      control.setAttribute(
        'aria-label',
        theme === 'dark' ? '切换到浅色模式' : '切换到深色模式',
      )
    }
  })
}

function setTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
  document.cookie = `theme=${theme}; path=/; max-age=31536000`
  updateThemeControls(theme)
  window.dispatchEvent(new CustomEvent('theme:change', { detail: { theme } }))
}

export function initThemeToggle() {
  const controls = document.querySelectorAll<HTMLElement>('[data-theme-control]')
  if (!controls.length) return

  controls.forEach((control) => {
    if (control.dataset.themeBound === 'true') return
    control.dataset.themeBound = 'true'

    control.addEventListener('click', () => {
      const mode = control.dataset.themeControl
      const theme = currentTheme()
      const nextTheme: Theme = mode === 'light' || mode === 'dark'
        ? mode
        : theme === 'dark' ? 'light' : 'dark'
      setTheme(nextTheme)
    })
  })

  updateThemeControls(currentTheme())
}

export interface AppMenuOptions {
  lockScroll?: boolean
}

/** 程序化关闭应用中心（如 studio 翻页动画切换前），等价于用户点关闭 */
export function closeAppMenu() {
  const menu = document.getElementById('app-menu')
  const backdrop = document.getElementById('app-menu-backdrop')
  const btn = document.getElementById('app-menu-toggle')
  if (!menu?.classList.contains('open')) return
  menu.classList.remove('open')
  backdrop?.classList.remove('open')
  menu.setAttribute('inert', '')
  menu.setAttribute('aria-hidden', 'true')
  btn?.setAttribute('aria-expanded', 'false')
}

export function initAppMenu({ lockScroll = false }: AppMenuOptions = {}) {
  const btn = document.getElementById('app-menu-toggle')
  const close = document.getElementById('app-menu-close')
  const menu = document.getElementById('app-menu')
  const backdrop = document.getElementById('app-menu-backdrop')
  const tiles = menu?.querySelector<HTMLElement>('.app-menu-tiles')
  if (!btn || !close || !menu || !backdrop || !tiles) return

  let prevBodyOverflow = ''

  const open = () => {
    menu.classList.add('open')
    backdrop.classList.add('open')
    menu.removeAttribute('inert')
    menu.setAttribute('aria-hidden', 'false')
    btn.setAttribute('aria-expanded', 'true')
    if (lockScroll) {
      prevBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    close.focus()
  }

  const closeMenu = () => {
    menu.classList.remove('open')
    backdrop.classList.remove('open')
    menu.setAttribute('inert', '')
    menu.setAttribute('aria-hidden', 'true')
    btn.setAttribute('aria-expanded', 'false')
    if (lockScroll) document.body.style.overflow = prevBodyOverflow
    btn.focus()
  }

  btn.addEventListener('click', open)
  close.addEventListener('click', closeMenu)
  backdrop.addEventListener('click', closeMenu)

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu()
  })

  menu.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const focusables = Array.from(menu.querySelectorAll<HTMLElement>('a, button'))
    if (!focusables.length) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      last.focus()
      e.preventDefault()
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus()
      e.preventDefault()
    }
  })

  tiles.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
    const items = Array.from(tiles.querySelectorAll<HTMLElement>('.tile'))
    if (!items.length) return
    const idx = items.indexOf(document.activeElement as HTMLElement)
    if (idx < 0) return
    const cols = getComputedStyle(tiles).gridTemplateColumns.split(' ').length
    const step = cols > 1 ? cols : 1
    let target = -1
    switch (e.key) {
      case 'ArrowRight': target = idx + step; break
      case 'ArrowLeft': target = idx - step; break
      case 'ArrowUp': target = idx - step; break
      case 'ArrowDown': target = idx + step; break
    }
    if (target >= 0 && target < items.length) {
      items[target].focus()
      e.preventDefault()
    }
  })
}
