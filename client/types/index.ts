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

export interface Room {
  id: string
  name: string
  description: string
  icon: string
}
