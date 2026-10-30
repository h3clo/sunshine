// Choose scenic streams with substantial sky and water or greenery in frame.
// Avoid street intersections, traffic cameras, and rotating city/road tours.
export interface City {
  id: string
  name: string
  country: string
  landscape: string
  latitude: number
  longitude: number
  timeZone: string
  videoId: string | null
}

export const cities: City[] = [
  { id: 'seoul', name: 'Seoul', country: 'South Korea', landscape: '한강 · 강 너머로 펼쳐지는 하늘', latitude: 37.52, longitude: 126.94, timeZone: 'Asia/Seoul', videoId: '5gVrWGRZo9s' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', landscape: '시드니 하버 · 바다와 하늘', latitude: -33.85, longitude: 151.21, timeZone: 'Australia/Sydney', videoId: '5uZa3-RMFos' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', landscape: '오다이바 · 도쿄만과 하늘', latitude: 35.63, longitude: 139.77, timeZone: 'Asia/Tokyo', videoId: 'GJhnjzX5xYI' },
  { id: 'honolulu', name: 'Honolulu', country: 'USA', landscape: '와이키키 · 바다와 다이아몬드 헤드', latitude: 21.28, longitude: -157.83, timeZone: 'Pacific/Honolulu', videoId: 'pv2RBs3PwCs' },
  { id: 'altea', name: 'Altea', country: 'Spain', landscape: '알테아 해변 · 지중해와 푸른 하늘', latitude: 38.599, longitude: -0.051, timeZone: 'Europe/Madrid', videoId: 'hvsK8Fvz4rE' },
  { id: 'new-york', name: 'Southampton, NY', country: 'USA', landscape: '쿠퍼스 비치 · 대서양과 모래사장', latitude: 40.884, longitude: -72.391, timeZone: 'America/New_York', videoId: 'AgnUddm-CQQ' },
]
