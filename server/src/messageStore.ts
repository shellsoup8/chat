import { Message } from './types.js'
import { randomUUID } from 'crypto'

const HISTORY_LIMIT = 100

// roomId → Message[]
const store = new Map<string, Message[]>()

export function getHistory(roomId: string): Message[] {
  return store.get(roomId) ?? []
}

export function addMessage(
  roomId: string,
  user: Message['user'],
  content: string
): Message {
  const msg: Message = {
    id: randomUUID(),
    roomId,
    user,
    content,
    timestamp: Date.now(),
  }
  const msgs = store.get(roomId) ?? []
  msgs.push(msg)
  if (msgs.length > HISTORY_LIMIT) msgs.splice(0, msgs.length - HISTORY_LIMIT)
  store.set(roomId, msgs)
  return msg
}
