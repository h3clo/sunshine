import './style.css'
import { setupMusic } from './music'
import { t, locale, language, languagePreference, cityText } from './i18n'
import { cities, type City } from './cities'
import { chooseDefaultCity, sortCitiesBySunshine } from './recommendations'
import { fetchWeather, localDate, describeWeather, daylightLabel, sunTime, type Weather } from './weather'

function getElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (!element) throw new Error(`요소를 찾을 수 없어요: ${selector}`)
  return element
}

document.documentElement.lang = language
document.title = t('Sunshine — 햇살이 머무는 창', 'Sunshine — A little window to sunshine')
document.querySelector('meta[name="description"]')?.setAttribute('content', t('하늘과 물빛, 햇살이 머무는 나만의 창', 'A little window to sunlit skies, water and nature.'))

const app = getElement<HTMLDivElement>('#app')
const skyCities = cities.filter((city) => !city.kind)
const otherCities = cities.filter((city) => city.kind)
const initialCity = skyCities[0]
if (!initialCity) throw new Error('도시 데이터를 확인해 주세요.')
let selectedCity: City = initialCity
let userSelectedCity = false
let defaultCityChosen = false

function getCityTime(city: City): string {
  if (city.weatherUnavailable) return '—'
  return new Intl.DateTimeFormat(locale, {
    timeZone: city.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date())
}

app.innerHTML = `
  <main class="app-shell">
    <header class="header">
      <a class="logo" href="#" aria-label="${t('Sunshine 홈', 'Sunshine home')}">
        <span class="logo-icon" aria-hidden="true">☀</span>
        sunshine<span class="logo-dot">.</span>
      </a>
      <div class="header-tools">
        <span class="header-caption">${t('햇살이 있는 곳으로', 'A window to somewhere sunny')}</span>

      </div>
    </header>
    <section class="viewer" aria-label="${t('라이브캠 뷰어', 'Live camera viewer')}">
      <div id="video-mount" class="video-mount"></div>
      <div class="viewer-bottom">
        <div class="location-info">
          <div class="location-heading"><h2 id="city-name"></h2><span id="video-status" class="video-status"></span></div>
          <p id="city-country"></p>
        </div>
        <div class="viewer-actions">
          <div class="clock-info"><span>${t('현지 시각', 'LOCAL TIME')}</span><strong id="city-clock"></strong></div>
          <button class="fullscreen-button" id="fullscreen-button" type="button"
            aria-label="${t('전체 화면으로 보기', 'Enter fullscreen')}" title="${t('전체 화면', 'Fullscreen')}">⛶</button>
        </div>
      </div>
      <div class="weather-panel" aria-label="${t('선택한 도시의 날씨', 'Weather at this location')}">
        <p id="current-weather">${t('날씨 불러오는 중…', 'Loading weather…')}</p>
        <div class="sun-times"><span id="sunrise">🌅 ${t('일출', 'Sunrise')} —</span><span id="sunset">🌇 ${t('일몰', 'Sunset')} —</span></div>
        <details class="weather-details"><summary>${t('날씨 정보', 'Weather details')}</summary><small id="weather-note">${t('현지 시각 기준', 'Local time')} · Open-Meteo</small></details>
        <button id="weather-retry" type="button" hidden>${t('날씨 다시 불러오기', 'Retry weather')}</button>
      </div>
    </section>
    <p id="viewer-message" class="viewer-message" role="status"></p>
    <section class="destinations" aria-labelledby="destinations-title">
      <div class="section-heading">
        <h2 id="destinations-title">${t('풍경', 'Views')} <span class="section-count">${skyCities.length}</span></h2>
      </div>
      <div class="city-list" id="city-list"></div>
    </section>
    <section class="destinations" aria-labelledby="other-views-title">
      <div class="section-heading">
        <h2 id="other-views-title">${t('다른 풍경', 'More views')} <span class="section-count">${otherCities.length}</span></h2>
      </div>
      <div class="city-list" id="other-city-list"></div>
    </section>
    <section id="music" class="music-section" aria-labelledby="music-title">
      <div class="music-heading">
        <h2 id="music-title"><span aria-hidden="true">♫</span> ${t('음악', 'Music')}</h2>
        <div class="music-options" role="group" aria-label="${t('음악 선택', 'Choose music')}">
          <button type="button" data-music="off" aria-pressed="true">${t('끄기', 'Off')}</button>
          <button type="button" data-music="jazz" aria-pressed="false">${t('재즈', 'Jazz')}</button>
          <button type="button" data-music="gugak" aria-pressed="false">${t('국악', 'Gugak')}</button>
        </div>
      </div>
      <p id="music-details" role="status">${t('음악을 골라 풍경과 함께 들어봐.', 'Pick some music to go with the view.')}</p>
      <div id="music-content" class="music-content" hidden>
        <div id="music-mount" class="music-player" hidden></div>
        <div class="music-info">
          <p id="music-track"></p>
          <p id="music-format"></p>
          <a id="music-source" target="_blank" rel="noopener noreferrer" hidden>${t('YouTube에서 열기 ↗', 'Open on YouTube ↗')}</a>
        </div>
      </div>
    </section>
    <footer class="footer"><span>${t('조금 더 환한 하루를 위해 ☀', 'Made for brighter days ☀')}</span><div class="footer-tools"><span>Sunshine v1.2</span>        <label class="language-control"><span class="sr-only">${t('언어 선택', 'Choose language')}</span>
          <select id="language-select">
            <option value="auto">${t('언어: 자동', 'Language: Auto')}</option>
            <option value="ko">한국어</option>
            <option value="en">English</option>
          </select>
        </label></div></footer>
  </main>
`

setupMusic()

const languageSelect = getElement<HTMLSelectElement>('#language-select')
languageSelect.value = languagePreference
languageSelect.addEventListener('change', () => {
  try { localStorage.setItem('sunshine-language', languageSelect.value) } catch {
    // Use an explicit URL preference if browser storage is unavailable.
    const url = new URL(window.location.href)
    url.searchParams.set('lang', languageSelect.value)
    window.location.assign(url)
    return
  }
  const url = new URL(window.location.href)
  url.searchParams.delete('lang')
  window.location.assign(url)
})

const videoMount = getElement<HTMLDivElement>('#video-mount')
const cityList = getElement<HTMLDivElement>('#city-list')
const otherCityList = getElement<HTMLDivElement>('#other-city-list')
const cityName = getElement<HTMLHeadingElement>('#city-name')
const cityCountry = getElement<HTMLParagraphElement>('#city-country')
const cityClock = getElement<HTMLElement>('#city-clock')
const videoStatus = getElement<HTMLElement>('#video-status')
const viewer = getElement<HTMLElement>('.viewer')
const viewerMessage = getElement<HTMLParagraphElement>('#viewer-message')
const fullscreenButton = getElement<HTMLButtonElement>('#fullscreen-button')

function createVideo(city: City): HTMLElement {
  const container = document.createElement('div')
  container.className = 'video-content'
  if (!city.videoId) {
    const placeholder = document.createElement('div')
    placeholder.className = 'video-placeholder'
    const icon = document.createElement('span')
    icon.className = 'placeholder-icon'
    icon.textContent = '☀'
    icon.setAttribute('aria-hidden', 'true')
    const title = document.createElement('h2')
    title.textContent = t(`${cityText(city).name}의 창문`, `A window to ${cityText(city).name}`)
    const description = document.createElement('p')
    description.textContent = t('라이브캠을 준비하고 있어요.', 'This live camera is coming soon.')
    placeholder.append(icon, title, description)
    container.append(placeholder)
    return container
  }
  const iframe = document.createElement('iframe')
  iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(city.videoId)}?hl=${language}&autoplay=1&mute=1&playsinline=1`
  iframe.title = city.recorded
    ? t(`${cityText(city).name} 녹화 영상`, `${cityText(city).name} recorded video`)
    : t(`${cityText(city).name} 라이브캠`, `${cityText(city).name} live camera`)
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'
  iframe.allowFullscreen = true
  iframe.referrerPolicy = 'strict-origin-when-cross-origin'
  container.append(iframe)
  return container
}

function updateClocks(): void {
  cityClock.textContent = getCityTime(selectedCity)
  document.querySelectorAll<HTMLButtonElement>('.city-button').forEach((button) => {
    const city = cities.find((item) => item.id === button.dataset.city)
    const time = button.querySelector<HTMLElement>('.city-button-time')
    if (city && time) time.textContent = getCityTime(city)
  })
}

function selectCity(city: City): void {
  selectedCity = city
  cityClock.parentElement!.hidden = Boolean(city.weatherUnavailable)
  getElement('.weather-panel').hidden = Boolean(city.weatherUnavailable)
  cityName.textContent = cityText(city).name
  cityCountry.textContent = `${cityText(city).country} · ${cityText(city).landscape}`
  videoStatus.textContent = city.recorded ? t('녹화 영상', 'Recorded video') : city.videoId ? t('영상 연결됨', 'Camera connected') : t('영상 준비 중', 'Camera coming soon')
  videoMount.replaceChildren(createVideo(city))
  document.querySelectorAll<HTMLButtonElement>('.city-button').forEach((button) => {
    const active = button.dataset.city === city.id
    button.classList.toggle('active', active)
    button.setAttribute('aria-pressed', String(active))
  })
  updateClocks()
  renderWeather()
}

cities.forEach((city) => {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'city-button'
  button.dataset.city = city.id
  button.setAttribute('aria-pressed', 'false')
  const name = document.createElement('strong')
  name.textContent = cityText(city).name
  const time = document.createElement('span')
  time.className = 'city-button-time'
  time.textContent = getCityTime(city)
  const landscape = document.createElement('span')
  landscape.className = 'city-landscape'
  landscape.textContent = cityText(city).landscape
  const weather = document.createElement('span')
  weather.className = 'city-weather'
  weather.textContent = t('날씨 불러오는 중…', 'Loading weather…')
  const sun = document.createElement('span')
  sun.className = 'city-sun-times'
  sun.textContent = '🌅 — · 🌇 —'
  if (city.kind) {
    const badge = document.createElement('span')
    badge.className = 'view-type'
    badge.textContent = city.kind === 'drive' ? (city.recorded ? t('🚗 드라이브 · 녹화', '🚗 Driving · Recorded') : t('🚗 드라이브 · 라이브', '🚗 Driving · Live')) : (city.recorded ? t('🐠 바닷속 · 녹화', '🐠 Underwater · Recorded') : t('🐠 바닷속', '🐠 Underwater'))
    button.append(badge)
  }
  button.append(name, landscape, time, weather, sun)
  button.addEventListener('click', () => {
    userSelectedCity = true
    selectCity(city)
  })
  ;(city.kind ? otherCityList : cityList).append(button)
})

fullscreenButton.addEventListener('click', async () => {
  viewerMessage.textContent = ''
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await viewer.requestFullscreen()
  } catch {
    viewerMessage.textContent = t('이 브라우저에서는 전체 화면으로 전환할 수 없어요.', 'Fullscreen is unavailable in this browser.')
  }
})

document.addEventListener('fullscreenchange', () => {
  const label = document.fullscreenElement === viewer ? t('전체 화면 종료', 'Exit fullscreen') : t('전체 화면으로 보기', 'Enter fullscreen')
  fullscreenButton.setAttribute('aria-label', label)
  fullscreenButton.title = label
})

const weatherByCity = new Map<string, Weather>()
const weatherFailures = new Set<string>()
let weatherLoading = false
const retryButton = getElement<HTMLButtonElement>('#weather-retry')

function getWeather(city: City): Weather | undefined {
  const weather = weatherByCity.get(city.id)
  if (!weather || weather.localDate !== localDate(city) ||
      Date.now() - weather.fetchedAt > 30 * 60_000) return undefined
  return weather
}

function renderWeather(): void {
  document.querySelectorAll<HTMLButtonElement>('.city-button').forEach((button) => {
    const city = cities.find((item) => item.id === button.dataset.city)
    if (!city) return
    const weather = getWeather(city)
    const summary = button.querySelector<HTMLElement>('.city-weather')
    const sun = button.querySelector<HTMLElement>('.city-sun-times')
    if (city.weatherUnavailable) {
      if (summary) summary.textContent = t('녹화 영상 · 촬영지 미확인', 'Recorded · Location unconfirmed')
      if (sun) sun.hidden = true
      return
    }
    if (summary) summary.textContent = weather
      ? `${daylightLabel(weather)} · ${describeWeather(weather.code, weather.isDay)} ${Math.round(weather.temperature)}°C`
      : weatherFailures.has(city.id) ? t('날씨 확인 불가', 'Weather unavailable') : t('날씨 불러오는 중…', 'Loading weather…')
    if (sun) sun.textContent = weather
      ? `🌅 ${sunTime(weather.sunrise)} · 🌇 ${sunTime(weather.sunset)}` : '🌅 — · 🌇 —'
  })
  const weather = getWeather(selectedCity)
  getElement('#current-weather').textContent = weather
    ? `${daylightLabel(weather)} · ${describeWeather(weather.code, weather.isDay)} · ${Math.round(weather.temperature)}°C`
    : weatherFailures.has(selectedCity.id) ? t('날씨를 불러오지 못했어요.', 'Unable to load weather.') : t('날씨 불러오는 중…', 'Loading weather…')
  getElement('#sunrise').textContent = `🌅 ${t('일출', 'Sunrise')} ${weather ? sunTime(weather.sunrise) : '—'}`
  getElement('#sunset').textContent = `🌇 ${t('일몰', 'Sunset')} ${weather ? sunTime(weather.sunset) : '—'}`
  getElement('#weather-note').textContent = weather
    ? `${t('현지', 'Local date')} ${weather.localDate} · Open-Meteo · ${new Intl.DateTimeFormat(locale, { timeZone: selectedCity.timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(weather.fetchedAt)} ${t('갱신', 'updated')}${weatherFailures.has(selectedCity.id) ? t(' · 갱신 지연', ' · Update delayed') : ''}`
    : `${t('현지 시각 기준', 'Local time')} · Open-Meteo`
  if (selectedCity.recorded) {
    getElement('#weather-note').textContent += t(' · 현재 날씨이며 녹화 시점과 달라요.', ' · Current weather, not conditions at the time of recording.')
  } else if (selectedCity.kind === 'drive') {
    getElement('#weather-note').textContent += t(' · 서울의 현재 날씨예요. 방송 속 촬영 시각·장소는 다를 수 있어요.', ' · Current weather in Seoul. The broadcast filming time and location may differ.')
  } else if (selectedCity.kind === 'underwater') {
    getElement('#weather-note').textContent += t(' · 날씨·낮/밤은 수면 위 기준이에요.', ' · Weather and daylight refer to conditions above water.')
  }
  retryButton.hidden = !weatherFailures.has(selectedCity.id)
  retryButton.disabled = weatherLoading
}

async function refreshWeather(): Promise<void> {
  if (weatherLoading) return
  weatherLoading = true
  renderWeather()
  await Promise.allSettled(cities.filter((city) => !city.weatherUnavailable).map(async (city) => {
    try {
      weatherByCity.set(city.id, await fetchWeather(city))
      weatherFailures.delete(city.id)
    } catch {
      weatherFailures.add(city.id)
    }
    renderWeather()
  }))
  weatherLoading = false
  // Move existing buttons after the whole batch, preserving their handlers and selection.
  const buttonsByCity = new Map(
    Array.from(cityList.querySelectorAll<HTMLButtonElement>('button'))
      .map((button) => [button.dataset.city, button] as const),
  )
  sortCitiesBySunshine(skyCities, getWeather).forEach((city, index) => {
    const button = buttonsByCity.get(city.id)
    if (button && cityList.children[index] !== button) {
      cityList.insertBefore(button, cityList.children[index] ?? null)
    }
  })
  if (!defaultCityChosen && !userSelectedCity) {
    cityList.scrollLeft = 0
    const recommended = chooseDefaultCity(skyCities, getWeather)
    if (recommended) {
      defaultCityChosen = true
      if (recommended.id !== selectedCity.id) selectCity(recommended)
    }
  }
  renderWeather()
}

retryButton.addEventListener('click', () => void refreshWeather())
selectCity(selectedCity)
void refreshWeather()
const weatherTimer = window.setInterval(() => void refreshWeather(), 5 * 60_000)
const clockTimer = window.setInterval(updateClocks, 1_000)
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.clearInterval(clockTimer)
    window.clearInterval(weatherTimer)
  })
}
