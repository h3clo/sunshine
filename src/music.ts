import { language, t } from './i18n'

export function setupMusic(): void {
  const section = document.querySelector<HTMLElement>('#music')
  if (!section) return
  const mount = section.querySelector<HTMLElement>('#music-mount')!
  const details = section.querySelector<HTMLElement>('#music-details')!
  const content = section.querySelector<HTMLElement>('#music-content')!
  const trackName = section.querySelector<HTMLElement>('#music-track')!
  const format = section.querySelector<HTMLElement>('#music-format')!
  const link = section.querySelector<HTMLAnchorElement>('#music-source')!
  const buttons = section.querySelectorAll<HTMLButtonElement>('[data-music]')
  const tracks = {
    jazz: {
      videoId: 'CBSlu_VMS9U',
      title: 'Lofi Girl · Jazz lofi mix',
      description: t('재즈 로파이 · 3시간 녹화 믹스', 'Jazz lofi · 3-hour recorded mix'),
    },
    gugak: {
      videoId: 'JhSkmET0msI',
      title: t('상상의 숲 · 국악 퓨전 로파이', 'Forest of Imagination · Gugak fusion lofi'),
      description: t('국악 로파이 · 녹화 플레이리스트 · AI 편곡', 'Gugak lofi · Recorded playlist · AI-assisted arrangement'),
    },
  }
  let selected = 'off'
  buttons.forEach((button) => button.addEventListener('click', () => {
    const choice = button.dataset.music!
    if (choice === selected) return
    selected = choice
    // Replace only the music player. City selection never touches this mount.
    mount.replaceChildren()
    buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)))
    if (choice === 'off') {
      content.hidden = true
      mount.hidden = true
      link.hidden = true
      details.textContent = t('음악을 골라 풍경과 함께 들어봐.', 'Pick some music to go with the view.')
      return
    }
    const track = tracks[choice as keyof typeof tracks]
    if (!track) return
    const iframe = document.createElement('iframe')
    iframe.src = `https://www.youtube-nocookie.com/embed/${track.videoId}?autoplay=1&playsinline=1&hl=${language}`
    iframe.title = track.title
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'
    iframe.allowFullscreen = true
    iframe.referrerPolicy = 'strict-origin-when-cross-origin'
    content.hidden = false
    mount.hidden = false
    mount.append(iframe)
    details.textContent = choice === 'jazz' ? t('재즈 로파이', 'Jazz lofi') : t('국악 로파이', 'Gugak lofi')
    trackName.textContent = track.title
    format.textContent = track.description
    link.href = `https://www.youtube.com/watch?v=${track.videoId}`
    link.hidden = false
  }))
}
