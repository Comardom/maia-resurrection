export function initBusuanzi() {
    const existing = document.querySelector('script[data-busuanzi]')
    if (existing) return
    const s = document.createElement('script')
    s.setAttribute('data-busuanzi', '')
    s.src = '//cdn.busuanzi.cc/busuanzi/3.6.9/busuanzi.min.js'
    s.defer = true
    document.body.appendChild(s)
}
