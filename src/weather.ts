import type { City } from './cities'

export interface Weather {
  temperature: number
  code: number
  isDay: boolean
  sunrise: string | null
  sunset: string | null
  localDate: string
  fetchedAt: number
}

export function localDate(city: City): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: city.timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const part = (type: string) => parts.find((item) => item.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export async function fetchWeather(city: City): Promise<Weather> {
  const params = new URLSearchParams({
    latitude: String(city.latitude), longitude: String(city.longitude),
    current: 'temperature_2m,weather_code,is_day',
    daily: 'sunrise,sunset', timezone: city.timeZone, forecast_days: '1',
  })
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new Error('날씨 정보를 불러오지 못했어요.')
  const data = await response.json()
  const current = data.current
  if (!current || !Number.isFinite(current.temperature_2m) ||
      !Number.isFinite(current.weather_code) || ![0, 1].includes(current.is_day) ||
      typeof data.daily?.time?.[0] !== 'string') {
    throw new Error('날씨 응답을 확인해 주세요.')
  }
  return {
    temperature: current.temperature_2m, code: current.weather_code,
    isDay: current.is_day === 1,
    sunrise: data.daily.sunrise?.[0] ?? null,
    sunset: data.daily.sunset?.[0] ?? null,
    localDate: data.daily.time[0], fetchedAt: Date.now(),
  }
}

export function describeWeather(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? '☀️ 맑음' : '🌙 맑음'
  if (code === 1) return '🌤️ 대체로 맑음'
  if (code === 2) return '⛅ 구름 조금'
  if (code === 3) return '☁️ 흐림'
  if ([45, 48].includes(code)) return '🌫️ 안개'
  if ([51, 53, 55, 56, 57].includes(code)) return '🌦️ 이슬비'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️ 비'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '🌨️ 눈'
  if ([95, 96, 99].includes(code)) return '⛈️ 뇌우'
  return '날씨 정보 없음'
}

export function daylightLabel(weather: Weather): string {
  return weather.isDay ? '☀️ 낮' : '🌙 밤'
}

export function sunTime(value: string | null): string {
  return value?.match(/T(\d{2}:\d{2})/)?.[1] ?? '정보 없음'
}

// Daylight always takes precedence over weather, then prefer clear skies.
export function chooseDefaultCity(
  candidates: City[],
  getWeather: (city: City) => Weather | undefined,
): City | undefined {
  function rank(weather: Weather): number {
    const clarity = weather.code >= 0 && weather.code <= 3 ? weather.code : 4
    return (weather.isDay ? 0 : 10) + clarity
  }
  let best: City | undefined
  let bestRank = Infinity
  for (const city of candidates) {
    if (!city.videoId) continue
    const weather = getWeather(city)
    if (!weather) continue
    const score = rank(weather)
    if (score < bestRank) {
      best = city
      bestRank = score
    }
  }
  return best
}
