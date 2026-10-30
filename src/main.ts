import './style.css'
import { cities, type City } from './cities'
import { chooseDefaultCity, fetchWeather, localDate, describeWeather, daylightLabel, sunTime, type Weather } from './weather'

function getElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (!element) throw new Error(`요소를 찾을 수 없어요: ${selector}`)
  return element
}

const app = getElement<HTMLDivElement>('#app')
const initialCity = cities[0]
if (!initialCity) throw new Error('도시 데이터를 확인해 주세요.')
let selectedCity: City = initialCity
let userSelectedCity = false
let defaultCityChosen = false

function getCityTime(city: City): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: city.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date())
}

app.innerHTML = `
  <main class="app-shell">
    <header class="header">
      <a class="logo" href="#" aria-label="Sunshine 홈">
        <span class="logo-icon" aria-hidden="true">☀</span>
        sunshine<span class="logo-dot">.</span>
      </a>
      <span class="header-caption">A window to somewhere sunny</span>
    </header>
    <section class="intro">
      <p class="eyebrow">YOUR LITTLE WINDOW TO THE WORLD</p>
      <h1>오늘은 어디의 햇살을<br />만나볼까?</h1>
      <p class="intro-description">멀리 떠나지 않아도 괜찮아.<br />하늘과 물빛, 자연의 풍경을 나만의 창문으로 만나봐.</p>
    </section>
    <section class="viewer" aria-label="라이브캠 뷰어">
      <div class="viewer-top">
        <span class="window-label"><span class="window-dot" aria-hidden="true"></span>YOUR WINDOW</span>
        <span id="video-status">영상 준비 중</span>
      </div>
      <div id="video-mount" class="video-mount"></div>
      <div class="viewer-bottom">
        <div class="location-info">
          <span class="location-label">NOW VIEWING</span>
          <h2 id="city-name"></h2>
          <p id="city-country"></p>
        </div>
        <div class="viewer-actions">
          <div class="clock-info"><span>LOCAL TIME</span><strong id="city-clock"></strong></div>
          <button class="fullscreen-button" id="fullscreen-button" type="button"
            aria-label="전체 화면으로 보기" title="전체 화면">⛶</button>
        </div>
      </div>
      <div class="weather-panel" aria-label="선택한 도시의 날씨">
        <p id="current-weather">날씨 불러오는 중…</p>
        <div class="sun-times"><span id="sunrise">🌅 일출 —</span><span id="sunset">🌇 일몰 —</span></div>
        <small id="weather-note">현지 시각 기준 · Open-Meteo</small>
        <button id="weather-retry" type="button" hidden>날씨 다시 불러오기</button>
      </div>
    </section>
    <p id="viewer-message" class="viewer-message" role="status"></p>
    <section class="destinations" aria-labelledby="destinations-title">
      <div class="section-heading">
        <h2 id="destinations-title">어디로 떠날까?</h2>
        <p>도시를 선택하면 나만의 창문이 바뀌어.</p>
      </div>
      <div class="city-list" id="city-list"></div>
    </section>
    <footer class="footer"><span>Made for brighter days ☀</span><span>Sunshine v1.0</span></footer>
  </main>
`

const videoMount = getElement<HTMLDivElement>('#video-mount')
const cityList = getElement<HTMLDivElement>('#city-list')
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
    title.textContent = `${city.name}의 창문`
    const description = document.createElement('p')
    description.textContent = '라이브캠을 준비하고 있어요.'
    placeholder.append(icon, title, description)
    container.append(placeholder)
    return container
  }
  const iframe = document.createElement('iframe')
  iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(city.videoId)}`
  iframe.title = `${city.name} 라이브캠`
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'
  iframe.allowFullscreen = true
  iframe.referrerPolicy = 'strict-origin-when-cross-origin'
  container.append(iframe)
  return container
}

function updateClocks(): void {
  cityClock.textContent = getCityTime(selectedCity)
  cityList.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
    const city = cities.find((item) => item.id === button.dataset.city)
    const time = button.querySelector<HTMLElement>('.city-button-time')
    if (city && time) time.textContent = getCityTime(city)
  })
}

function selectCity(city: City): void {
  selectedCity = city
  cityName.textContent = city.name
  cityCountry.textContent = `${city.country} · ${city.landscape}`
  videoStatus.textContent = city.videoId ? '영상 등록됨' : '영상 준비 중'
  videoMount.replaceChildren(createVideo(city))
  cityList.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
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
  name.textContent = city.name
  const time = document.createElement('span')
  time.className = 'city-button-time'
  time.textContent = getCityTime(city)
  const landscape = document.createElement('span')
  landscape.className = 'city-landscape'
  landscape.textContent = city.landscape
  const weather = document.createElement('span')
  weather.className = 'city-weather'
  weather.textContent = '날씨 불러오는 중…'
  const sun = document.createElement('span')
  sun.className = 'city-sun-times'
  sun.textContent = '🌅 — · 🌇 —'
  button.append(name, landscape, time, weather, sun)
  button.addEventListener('click', () => {
    userSelectedCity = true
    selectCity(city)
  })
  cityList.append(button)
})

fullscreenButton.addEventListener('click', async () => {
  viewerMessage.textContent = ''
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await viewer.requestFullscreen()
  } catch {
    viewerMessage.textContent = '이 브라우저에서는 전체 화면으로 전환할 수 없어요.'
  }
})

document.addEventListener('fullscreenchange', () => {
  const label = document.fullscreenElement === viewer ? '전체 화면 종료' : '전체 화면으로 보기'
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
  cityList.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
    const city = cities.find((item) => item.id === button.dataset.city)
    if (!city) return
    const weather = getWeather(city)
    const summary = button.querySelector<HTMLElement>('.city-weather')
    const sun = button.querySelector<HTMLElement>('.city-sun-times')
    if (summary) summary.textContent = weather
      ? `${daylightLabel(weather)} · ${describeWeather(weather.code, weather.isDay)} ${Math.round(weather.temperature)}°C`
      : weatherFailures.has(city.id) ? '날씨 확인 불가' : '날씨 불러오는 중…'
    if (sun) sun.textContent = weather
      ? `🌅 ${sunTime(weather.sunrise)} · 🌇 ${sunTime(weather.sunset)}` : '🌅 — · 🌇 —'
  })
  const weather = getWeather(selectedCity)
  getElement('#current-weather').textContent = weather
    ? `${daylightLabel(weather)} · ${describeWeather(weather.code, weather.isDay)} · ${Math.round(weather.temperature)}°C`
    : weatherFailures.has(selectedCity.id) ? '날씨를 불러오지 못했어요.' : '날씨 불러오는 중…'
  getElement('#sunrise').textContent = `🌅 일출 ${weather ? sunTime(weather.sunrise) : '—'}`
  getElement('#sunset').textContent = `🌇 일몰 ${weather ? sunTime(weather.sunset) : '—'}`
  getElement('#weather-note').textContent = weather
    ? `현지 ${weather.localDate} 기준 · Open-Meteo · ${new Intl.DateTimeFormat('ko-KR', { timeZone: selectedCity.timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(weather.fetchedAt)} 갱신${weatherFailures.has(selectedCity.id) ? ' · 갱신 지연' : ''}`
    : '현지 시각 기준 · Open-Meteo'
  retryButton.hidden = !weatherFailures.has(selectedCity.id)
  retryButton.disabled = weatherLoading
}

async function refreshWeather(): Promise<void> {
  if (weatherLoading) return
  weatherLoading = true
  renderWeather()
  await Promise.allSettled(cities.map(async (city) => {
    try {
      weatherByCity.set(city.id, await fetchWeather(city))
      weatherFailures.delete(city.id)
    } catch {
      weatherFailures.add(city.id)
    }
    renderWeather()
  }))
  weatherLoading = false
  if (!defaultCityChosen && !userSelectedCity) {
    const recommended = chooseDefaultCity(cities, getWeather)
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
