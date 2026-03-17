import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import session from 'express-session'
import cors from 'cors'
import passport from './auth.js'
import { getHistory, addMessage } from './messageStore.js'
import { ROOMS } from './rooms.js'
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  ChatUser,
} from './types.js'

const app = express()
const httpServer = createServer(app)

const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:3000'

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(express.json())

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET ?? 'retrochat-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
})
app.use(sessionMiddleware)
app.use(passport.initialize())
app.use(passport.session())

// ── Auth Routes ─────────────────────────────────────────────
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${CLIENT_URL}/login?error=google` }),
  (_req, res) => res.redirect(`${CLIENT_URL}/room/general`)
)


app.get('/auth/me', (req, res) => {
  if (req.isAuthenticated()) return res.json(req.user)
  res.status(401).json({ error: 'Not authenticated' })
})

app.post('/auth/logout', (req, res) => {
  req.logout(() => res.json({ ok: true }))
})

app.get('/rooms', (_req, res) => {
  res.json(ROOMS)
})

// ── Socket.io ───────────────────────────────────────────────
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: CLIENT_URL, credentials: true },
})

// Share express session with Socket.io
io.engine.use(sessionMiddleware)
io.engine.use(passport.initialize())
io.engine.use(passport.session())

// roomId → Set of socket ids
const roomSockets = new Map<string, Set<string>>()

function roomCount(roomId: string) {
  return roomSockets.get(roomId)?.size ?? 0
}

io.on('connection', (socket) => {
  const req = socket.request as express.Request
  const user = req.user as ChatUser | undefined

  if (!user) {
    socket.emit('error', 'NOT_AUTHENTICATED')
    socket.disconnect()
    return
  }

  // ── room:join ──
  socket.on('room:join', (roomId) => {
    const valid = ROOMS.some(r => r.id === roomId)
    if (!valid) return

    socket.join(roomId)
    const sockets = roomSockets.get(roomId) ?? new Set()
    sockets.add(socket.id)
    roomSockets.set(roomId, sockets)

    // Send history
    socket.emit('history', getHistory(roomId))
    // Broadcast join
    socket.to(roomId).emit('user:joined', user)
    // Update count for everyone
    io.to(roomId).emit('room:users', roomCount(roomId))
  })

  // ── room:leave ──
  socket.on('room:leave', (roomId) => {
    socket.leave(roomId)
    roomSockets.get(roomId)?.delete(socket.id)
    socket.to(roomId).emit('user:left', user.id)
    io.to(roomId).emit('room:users', roomCount(roomId))
  })

  // ── message:send ──
  socket.on('message:send', ({ roomId, content }) => {
    if (!content?.trim()) return
    const msg = addMessage(roomId, user, content.trim().slice(0, 500))
    io.to(roomId).emit('message:new', msg)
  })

  // ── disconnect ──
  socket.on('disconnect', () => {
    for (const [roomId, sockets] of roomSockets.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id)
        socket.to(roomId).emit('user:left', user.id)
        io.to(roomId).emit('room:users', roomCount(roomId))
      }
    }
  })
})

// ── Start ───────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 4000)
httpServer.listen(PORT, () => {
  console.log(`🖥  RETROCHAT SERVER — port ${PORT}`)
})
