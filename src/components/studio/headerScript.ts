export function initThemeToggle() {
  const btn = document.getElementById('theme-toggle')
  if (!btn) return
  btn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark')
    document.cookie = `theme=${isDark ? 'dark' : 'light'}; path=/; max-age=31536000`
  })
}
export function initAppMenu() {
  const btn = document.getElementById('app-menu-toggle')
  const close = document.getElementById('app-menu-close')
  const menu = document.getElementById('app-menu')
  const backdrop = document.getElementById('app-menu-backdrop')
  if (!btn || !close || !menu || !backdrop) return

  const open = () => {
    menu.classList.add('open')
    backdrop.classList.add('open')
    menu.setAttribute('aria-hidden', 'false')
  }
  const closeMenu = () => {
    menu.classList.remove('open')
    backdrop.classList.remove('open')
    menu.setAttribute('aria-hidden', 'true')
  }

  btn.addEventListener('click', open)
  close.addEventListener('click', closeMenu)
  backdrop.addEventListener('click', closeMenu)
}