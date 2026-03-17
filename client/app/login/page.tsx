'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { fetchMe, googleLoginUrl } from '@/lib/api'
import styles from './page.module.css'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const error = params.get('error')
  const [checking, setChecking] = useState(true)
  const [lines, setLines] = useState<string[]>([])

  const BOOT = [
    'RETROCHAT OS v2.4.1',
    'INITIALIZING NETWORK STACK......... OK',
    'LOADING AUTH MODULES............... OK',
    'ESTABLISHING SECURE CHANNEL........ OK',
    '> AUTHENTICATION REQUIRED.',
  ]

  useEffect(() => {
    fetchMe().then(u => {
      if (u) { router.push('/room/general'); return }
      setChecking(false)
      let i = 0
      const t = setInterval(() => {
        if (i < BOOT.length) setLines(p => [...p, BOOT[i++]])
        else clearInterval(t)
      }, 250)
      return () => clearInterval(t)
    })
  }, [])

  if (checking) return (
    <div className={styles.page}>
      <div className={styles.crt} /><div className={styles.scanline} />
      <div className={styles.spinner} />
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.crt} />
      <div className={styles.scanline} />

      <div className={styles.terminal}>
        <div className={styles.termHeader}>
          <span className={styles.dot} style={{ background: '#ff5f57' }} />
          <span className={styles.dot} style={{ background: '#febc2e' }} />
          <span className={styles.dot} style={{ background: '#28c840' }} />
          <span className={styles.termTitle}>RETROCHAT — AUTH TERMINAL</span>
        </div>

        <div className={styles.termBody}>
          {lines.map((l, i) => (
            <div key={i} className={styles.bootLine}>{l}</div>
          ))}

          {lines.length === BOOT.length && (
            <div className={styles.authSection}>
              {error && (
                <div className={styles.errorBox}>
                  !! AUTH FAILED [{error.toUpperCase()}] — TRY AGAIN
                </div>
              )}

              <div className={styles.authLabel}>SELECT IDENTITY PROVIDER:</div>

              <a href={googleLoginUrl()} className={styles.oauthBtn}>
                <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
                  <path d="M44.5 20H24v8.5h11.8C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.2-2.7-.5-4z" fill="#4285F4"/>
                  <path d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 16.3 3 9.7 7.9 6.3 14.7z" fill="#EA4335"/>
                  <path d="M24 45c5.5 0 10.4-1.9 14.2-5l-6.6-5.4C29.6 36.1 26.9 37 24 37c-5.7 0-10.5-3.8-12.2-9H4.7C8.1 37.8 15.5 45 24 45z" fill="#34A853"/>
                  <path d="M44.5 20H24v8.5h11.8c-1 2.8-2.8 5.1-5.2 6.6l6.6 5.4C41.6 37 45 31 45 24c0-1.3-.2-2.7-.5-4z" fill="#FBBC05"/>
                </svg>
                CONTINUE WITH GOOGLE
              </a>

              <div className={styles.disclaimer}>
                로그인 시 서비스 이용약관에 동의하는 것으로 간주됩니다
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
