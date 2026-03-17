const BASE = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:4000'

export async function fetchMe() {
  const res = await fetch(`${BASE}/auth/me`, { credentials: 'include' })
  if (!res.ok) return null
  return res.json()
}

export async function logout() {
  await fetch(`${BASE}/auth/logout`, { method: 'POST', credentials: 'include' })
}

export function googleLoginUrl() {
  return `${BASE}/auth/google`
}

export function githubLoginUrl() {
  return `${BASE}/auth/github`
}
