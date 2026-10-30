// Choose scenic streams with substantial sky and water or greenery in frame.
// Driving and underwater views are explicitly labeled exceptions to the sky-first selection.
export interface City {
  id: string
  name: string
  country: string
  landscape: string
  latitude: number
  longitude: number
  timeZone: string
  videoId: string | null
  kind?: 'drive' | 'underwater'
  recorded?: boolean
  weatherUnavailable?: boolean
}

export const cities: City[] = [
  { id: 'seoul', name: 'Seoul', country: 'South Korea', landscape: '한강 · 강 너머로 펼쳐지는 하늘', latitude: 37.52, longitude: 126.94, timeZone: 'Asia/Seoul', videoId: '5gVrWGRZo9s' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', landscape: '시드니 하버 · 바다와 하늘', latitude: -33.85, longitude: 151.21, timeZone: 'Australia/Sydney', videoId: '5uZa3-RMFos' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', landscape: '오다이바 · 도쿄만과 하늘', latitude: 35.63, longitude: 139.77, timeZone: 'Asia/Tokyo', videoId: 'GJhnjzX5xYI' },
  { id: 'honolulu', name: 'Honolulu', country: 'USA', landscape: '와이키키 · 바다와 다이아몬드 헤드', latitude: 21.28, longitude: -157.83, timeZone: 'Pacific/Honolulu', videoId: 'pv2RBs3PwCs' },
  { id: 'altea', name: 'Altea', country: 'Spain', landscape: '알테아 해변 · 지중해와 푸른 하늘', latitude: 38.599, longitude: -0.051, timeZone: 'Europe/Madrid', videoId: 'hvsK8Fvz4rE' },
  { id: 'new-york', name: 'New York', country: 'USA', landscape: '브라이언트 파크 · 맨해튼의 공원', latitude: 40.7537, longitude: -73.9836, timeZone: 'America/New_York', videoId: 'hMWSUCXkj6w' },
  { id: 'davos', name: 'Davos', country: 'Switzerland', landscape: '야콥스호른 · 알프스 산맥과 하늘', latitude: 46.772, longitude: 9.849, timeZone: 'Europe/Zurich', videoId: 'sSen5EoOiJs' },
  { id: 'lake-tahoe', name: 'Lake Tahoe', country: 'USA', landscape: '제퍼 코브 · 호수와 시에라네바다 산맥', latitude: 39.006, longitude: -119.949, timeZone: 'America/Los_Angeles', videoId: 'Lk0Z5ExUWL0' },
  { id: 'seoul-drive', name: 'Seoul Drive', country: 'South Korea', landscape: '서울 드라이브 · 라이브 방송', latitude: 37.5665, longitude: 126.978, timeZone: 'Asia/Seoul', videoId: '8k5E-6nNrgU', kind: 'drive' },
  { id: 'underwater', name: 'Underwater', country: 'Soul Sound', landscape: '4K 스쿠버 · 마음이 편안해지는 바닷속', latitude: 0, longitude: 0, timeZone: 'UTC', videoId: '0RiP_lGlmpQ', kind: 'underwater', recorded: true, weatherUnavailable: true },
]
