export interface ChatUser {
  id: string
  name: string
  avatar: string
  color: string
  provider: 'google' | 'github'
}

export interface Message {
  id: string
  roomId: string
  user: ChatUser
  content: string
  timestamp: number
}

export interface RoomInfo {
  id: string
  name: string
  description: string
  icon: string
  onlineCount: number
}

// Socket event maps
export interface ServerToClientEvents {
  'message:new': (msg: Message) => void
  'room:users': (count: number) => void
  'user:joined': (user: ChatUser) => void
  'user:left': (userId: string) => void
  'history': (messages: Message[]) => void
  'error': (msg: string) => void
}

export interface ClientToServerEvents {
  'message:send': (data: { roomId: string; content: string }) => void
  'room:join': (roomId: string) => void
  'room:leave': (roomId: string) => void
}
