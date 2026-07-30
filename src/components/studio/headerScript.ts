export function initThemeToggle() {
    const btn = document.getElementById('theme-toggle')!
    const icon = document.getElementById('toggle-icon')!
    const label = document.getElementById('toggle-label')!

    function syncUI() {
        const isDark = document.documentElement.classList.contains('dark')
        icon.textContent = isDark ? '☀️' : '🌙'
        label.textContent = isDark ? '亮色' : '暗色'
    }

    btn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark')
        document.cookie = `theme=${isDark ? 'dark' : 'light'}; path=/; max-age=31536000`
        syncUI()
    })

    syncUI()
}