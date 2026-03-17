export const ROOMS = [
  { id: 'general', name: 'general', description: '모두를 위한 공간', icon: '📡' },
  { id: 'tech',    name: 'tech',    description: '기술 이야기',       icon: '⚙️' },
  { id: 'music',   name: 'music',   description: '음악 토론',         icon: '🎵' },
  { id: 'random',  name: 'random',  description: '아무 얘기나',       icon: '🎲' },
] as const

export const USER_COLORS = [
  '#00ff9d', '#ffcc00', '#ff6b6b', '#74b9ff',
  '#fd79a8', '#a29bfe', '#55efc4', '#fdcb6e',
]

export function pickColor(seed: string): string {
  let hash = 0
  for (const c of seed) hash = (hash * 31 + c.charCodeAt(0)) | 0
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length]
}
