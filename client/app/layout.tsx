import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RETROCHAT — THE GRID',
  description: '실시간 멀티룸 레트로 채팅',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=VT323&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
