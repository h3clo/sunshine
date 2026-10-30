import type { City } from './cities'
import type { Weather } from './weather'

// Share one priority rule between the initial view and the city list.
function sunshineRank(weather: Weather | undefined): number {
  if (!weather) return Infinity
  const clarity = weather.code >= 0 && weather.code <= 3 ? weather.code : 4
  return (weather.isDay ? 0 : 10) + clarity
}

export function sortCitiesBySunshine(
  candidates: readonly City[],
  getWeather: (city: City) => Weather | undefined,
): City[] {
  return candidates.map((city, index) => ({ city, index, rank: city.recorded ? Infinity : sunshineRank(getWeather(city)) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ city }) => city)
}

export function chooseDefaultCity(
  candidates: readonly City[],
  getWeather: (city: City) => Weather | undefined,
): City | undefined {
  return sortCitiesBySunshine(candidates, getWeather)
    .find((city) => city.videoId && !city.kind && !city.recorded && getWeather(city))
}
