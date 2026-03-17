'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { getSocket } from '@/lib/socket'
import { fetchMe, logout } from '@/lib/api'
import { ROOMS } from '@/lib/rooms'
import { Message, ChatUser } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import styles from './page.module.css'

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = use(params)
  const router = useRouter()

  const [user, setUser]         = useState<ChatUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [onlineCount, setOnline] = useState(0)
  const [input, setInput]       = useState('')
  const [sending, setSending]   = useState(false)
  const [connected, setConnected] = useState(false)
  const prevRoomRef = useRef<string | null>(null)
  const bottomRef   = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLInputElement>(null)

  const room = ROOMS.find(r => r.id === roomId) ?? ROOMS[0]

  // ── auth check ──────────────────────────────────────────────
  useEffect(() => {
    fetchMe().then(u => {
      if (!u) { router.push('/login'); return }
      setUser(u)
    })
  }, [router])

  // ── socket lifecycle ─────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    const socket = getSocket()

    if (!socket.connected) socket.connect()

    function onConnect() {
      setConnected(true)
      socket.emit('room:join', roomId)
      prevRoomRef.current = roomId
    }
    function onDisconnect() { setConnected(false) }
    function onHistory(msgs: Message[]) { setMessages(msgs) }
    function onNewMsg(msg: Message) { setMessages(p => [...p, msg]) }
    function onUsers(count: number) { setOnline(count) }
    function onError(msg: string) { if (msg === 'NOT_AUTHENTICATED') router.push('/login') }

    socket.on('connect',      onConnect)
    socket.on('disconnect',   onDisconnect)
    socket.on('history',      onHistory)
    socket.on('message:new',  onNewMsg)
    socket.on('room:users',   onUsers)
    socket.on('error',        onError)

    if (socket.connected) onConnect()

    return () => {
      socket.off('connect',     onConnect)
      socket.off('disconnect',  onDisconnect)
      socket.off('history',     onHistory)
      socket.off('message:new', onNewMsg)
      socket.off('room:users',  onUsers)
      socket.off('error',       onError)
    }
  }, [user, roomId, router])

  // ── room switch ──────────────────────────────────────────────
  useEffect(() => {
    if (!connected) return
    const socket = getSocket()
    const prev = prevRoomRef.current
    if (prev && prev !== roomId) {
      socket.emit('room:leave', prev)
      setMessages([])
    }
    socket.emit('room:join', roomId)
    prevRoomRef.current = roomId
  }, [roomId, connected])

  // ── auto-scroll ──────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── send ─────────────────────────────────────────────────────
  function sendMessage() {
    const text = input.trim()
    if (!text || sending || !connected) return
    setInput('')
    setSending(true)
    getSocket().emit('message:send', { roomId, content: text })
    setTimeout(() => setSending(false), 300)
    inputRef.current?.focus()
  }

  async function handleLogout() {
    getSocket().disconnect()
    await logout()
    router.push('/login')
  }

  if (!user) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0a0a' }}>
      <div style={{ width:28, height:28, border:'2px solid #1a3a1a', borderTopColor:'#00ff9d', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
    </div>
  )

  return (
    <div className={styles.layout}>
      <div className={styles.crt} />
      <div className={styles.scanline} />

      {/* ── SIDEBAR ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}>RETROCHAT</div>
          <div className={styles.logoSub}>V2.4 // THE GRID</div>
        </div>

        <nav className={styles.roomList}>
          <div className={styles.sectionLabel}>CHANNELS</div>
          {ROOMS.map(r => (
            <a
              key={r.id}
              href={`/room/${r.id}`}
              className={`${styles.roomItem} ${r.id === roomId ? styles.active : ''}`}
            >
              <span className={styles.roomDot} />
              <span># {r.name}</span>
            </a>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userRow}>
            {user.avatar
              ? <img src={user.avatar} className={styles.avatar} alt="" />
              : <div className={styles.avatarFallback} style={{ background: user.color }}>{user.name[0]}</div>
            }
            <div className={styles.userInfo}>
              <div className={styles.userName} style={{ color: user.color }}>{user.name}</div>
              <div className={styles.userProvider}>via {user.provider}</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>[ LOGOUT ]</button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className={styles.main}>
        {/* topbar */}
        <header className={styles.topbar}>
          <div>
            <div className={styles.topbarRoom}># {room.name}</div>
            <div className={styles.topbarDesc}>{room.description}</div>
          </div>
          <div className={styles.topbarRight}>
            <span className={connected ? styles.onlinePill : styles.offlinePill}>
              {connected ? `● ${onlineCount} ONLINE` : '○ CONNECTING...'}
            </span>
          </div>
        </header>

        {/* messages */}
        <div className={styles.messages}>
          <div className={styles.systemMsg}>
            ─── {room.name.toUpperCase()} CHANNEL INITIALIZED ───
          </div>

          {messages.map(msg => {
            const isMe = msg.user.id === user.id
            return (
              <div key={msg.id} className={`${styles.msgRow} ${isMe ? styles.mine : ''}`}>
                <div className={styles.msgMeta}>
                  {!isMe && (
                    <>
                      {msg.user.avatar
                        ? <img src={msg.user.avatar} className={styles.msgAvatar} alt="" />
                        : <div className={styles.msgAvatarFallback} style={{ background: msg.user.color }}>{msg.user.name[0]}</div>
                      }
                    </>
                  )}
                  <span className={styles.msgUser} style={{ color: msg.user.color }}>
                    {isMe ? 'YOU' : msg.user.name}
                  </span>
                  <span className={styles.msgTime}>
                    {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true, locale: ko })}
                  </span>
                </div>
                <div
                  className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleOther}`}
                  style={isMe ? { borderColor: user.color + '55', background: user.color + '0d' } : {}}
                >
                  {msg.content}
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* input */}
        <footer className={styles.inputArea}>
          <div className={styles.inputRow}>
            <span className={styles.cursor}>█</span>
            <input
              ref={inputRef}
              className={styles.chatInput}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={connected ? `#${room.name} 에 메시지 전송...` : '연결 중...'}
              disabled={!connected || sending}
              maxLength={500}
            />
            <button
              className={styles.sendBtn}
              onClick={sendMessage}
              disabled={!connected || sending || !input.trim()}
            >
              SEND
            </button>
          </div>
          <div className={styles.inputHint}>ENTER TO SEND &nbsp;·&nbsp; #{room.name.toUpperCase()}</div>
        </footer>
      </main>
    </div>
  )
}
