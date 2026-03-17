'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchMe } from '@/lib/api'

export default function Root() {
  const router = useRouter()
  useEffect(() => {
    fetchMe().then(u => router.push(u ? '/room/general' : '/login'))
  }, [])
  return null
}
