import type { City } from './cities'

export type Language = 'ko' | 'en'
export function detectLanguage(languages: readonly string[]): Language {
  for (const language of languages) {
    const base = language.toLowerCase().split('-')[0]
    if (base === 'ko' || base === 'en') return base
  }
  return 'en'
}

let preference = 'auto'
try { preference = localStorage.getItem('sunshine-language') ?? 'auto' } catch { /* Storage may be disabled. */ }
if (typeof window !== 'undefined') {
  preference = new URLSearchParams(window.location.search).get('lang') ?? preference
}
export const languagePreference = ['ko', 'en'].includes(preference) ? preference : 'auto'
export const language: Language = languagePreference === 'auto'
  ? detectLanguage(typeof navigator === 'undefined' ? ['en'] : navigator.languages)
  : languagePreference as Language
export const locale = language === 'ko' ? 'ko-KR' : 'en-US'
export const t = (ko: string, en: string): string => language === 'ko' ? ko : en

const places: Record<string, { name: string; country: string; landscape: string }> = {
  seoul: { name: '서울', country: '대한민국', landscape: 'Han River · Open sky over the water' },
  sydney: { name: '시드니', country: '호주', landscape: 'Sydney Harbour · Sea and sky' },
  tokyo: { name: '도쿄', country: '일본', landscape: 'Odaiba · Tokyo Bay and open sky' },
  honolulu: { name: '호놀룰루', country: '미국', landscape: 'Waikiki · Ocean and Diamond Head' },
  altea: { name: '알테아', country: '스페인', landscape: 'Altea Beach · Mediterranean sea and sky' },
  'seoul-drive': { name: '서울 드라이브', country: '대한민국', landscape: 'Seoul driving tour · Live broadcast' },
  underwater: { name: '바닷속 여행', country: '소울사운드', landscape: '4K scuba · A peaceful underwater journey' },
  'new-york': { name: '뉴욕', country: '미국', landscape: 'Bryant Park · A park in Manhattan' },
  davos: { name: '다보스', country: '스위스', landscape: 'Jakobshorn · Alpine peaks and open sky' },
  'lake-tahoe': { name: '타호 호수', country: '미국', landscape: 'Zephyr Cove · Lake and Sierra Nevada mountains' },
}
export function cityText(city: City) {
  const place = places[city.id]
  return {
    name: language === 'ko' ? place?.name ?? city.name : city.name,
    country: language === 'ko' ? place?.country ?? city.country : city.country,
    landscape: language === 'ko' ? city.landscape : place?.landscape ?? city.landscape,
  }
}
