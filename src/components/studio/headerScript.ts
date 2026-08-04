export function initThemeToggle() {
  const btn = document.getElementById('theme-toggle')
  if (!btn) return
  btn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark')
    document.cookie = `theme=${isDark ? 'dark' : 'light'}; path=/; max-age=31536000`
  })
}

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
  document.body.style.overflow = ''
}

export function initAppMenu() {
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
    prevBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    close.focus()
  }

  const closeMenu = () => {
    menu.classList.remove('open')
    backdrop.classList.remove('open')
    menu.setAttribute('inert', '')
    menu.setAttribute('aria-hidden', 'true')
    btn.setAttribute('aria-expanded', 'false')
    document.body.style.overflow = prevBodyOverflow
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
    let target = -1
    switch (e.key) {
      case 'ArrowRight': target = idx + 1; break
      case 'ArrowLeft': target = idx - 1; break
      case 'ArrowUp': target = idx - cols; break
      case 'ArrowDown': target = idx + cols; break
    }
    if (target >= 0 && target < items.length) {
      items[target].focus()
      e.preventDefault()
    }
  })
}
