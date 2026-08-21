import { currentTheme } from '../header/headerScript'

function setActiveLink(
    links: HTMLAnchorElement[],
    separators: HTMLElement[],
    id: string,
) {
    links.forEach((link) => {
        const isActive = link.dataset.officeSectionLink === id
        link.classList.toggle('is-active', isActive)

        if (isActive) {
            link.setAttribute('aria-current', 'page')
        } else {
            link.removeAttribute('aria-current')
        }
    })

    separators.forEach((separator) => {
        const isLeftActive = separator.dataset.leftId === id
        const isRightActive = separator.dataset.rightId === id
        separator.classList.toggle('is-left-active', isLeftActive)
        separator.classList.toggle('is-right-active', isRightActive)
    })
}

function setActiveThemeSeparator(separators: HTMLElement[], theme: 'light' | 'dark') {
    separators.forEach((separator) => {
        const isLeftActive = separator.dataset.leftTheme === theme
        const isRightActive = separator.dataset.rightTheme === theme
        separator.classList.toggle('is-left-active', isLeftActive)
        separator.classList.toggle('is-right-active', isRightActive)
    })
}

export function initSectionNav() {
    const themeSeparators = Array.from(
        document.querySelectorAll<HTMLElement>('[data-office-theme-separator]'),
    )
    setActiveThemeSeparator(themeSeparators, currentTheme())
    window.addEventListener('theme:change', (event) => {
        const theme = (event as CustomEvent<{ theme?: 'light' | 'dark' }>).detail?.theme
        setActiveThemeSeparator(themeSeparators, theme ?? currentTheme())
    })

    const links = Array.from(
        document.querySelectorAll<HTMLAnchorElement>('[data-office-section-link]'),
    )
    if (!links.length) return

    const separators = Array.from(
        document.querySelectorAll<HTMLElement>('[data-office-section-separator]'),
    )

    const targets = links
        .map((link) => document.getElementById(link.dataset.officeSectionLink ?? ''))
        .filter((target): target is HTMLElement => target !== null)

    const hashId = window.location.hash.replace(/^#/, '')
    const initialId = links.some((link) => link.dataset.officeSectionLink === hashId)
        ? hashId
        : targets[0]?.id ?? links[0].dataset.officeSectionLink ?? 'home'

    setActiveLink(links, separators, initialId)

    links.forEach((link) => {
        link.addEventListener('click', (event) => {
            const id = link.dataset.officeSectionLink
            if (!id) return

            setActiveLink(links, separators, id)

            const target = document.getElementById(id)
            if (!target) return

            event.preventDefault()
            target.scrollIntoView({
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                    ? 'auto'
                    : 'smooth',
                block: 'start',
            })
            window.history.replaceState(null, '', `#${id}`)
        })
    })

    if (!targets.length || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
        (entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

            if (visible[0]) setActiveLink(links, separators, visible[0].target.id)
        },
        {
            rootMargin: '-20% 0px -60% 0px',
            threshold: [0, 0.25, 0.5, 0.75, 1],
        },
    )

    targets.forEach((target) => observer.observe(target))
}
