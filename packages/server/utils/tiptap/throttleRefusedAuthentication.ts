import ms from 'ms'
import {Logger} from '../Logger'
import type {YjsContext} from './authenticateYjsConnection'

const MAX_REFUSALS = 100
const REFUSAL_WINDOW = ms('1m')
const BAN_DURATION = ms('1m')
// A refusal counts once it lands, so without a cap a burst sent at once would all run before the ban.
// A socket holds up to 500 pending documents, so this lets 2 of one user's sockets authenticate at once
const MAX_PENDING = 1000
// Hocuspocus logs a rejection that has a message, so a banned request rejects without one and the ban is logged once
const tooManyRefusals = {reason: 'TooManyRequests'}

type AuthenticatePayload = {documentName: string; context: YjsContext}

// Not Unauthenticated: an ended session gets it for every document at once, and the client signs out on the first
const isCountedRefusal = (error: unknown) =>
  error instanceof Error &&
  'reason' in error &&
  (error.reason === 'Unauthorized' || error.reason === 'InvalidDocument')

// Hocuspocus authenticates every document on a socket, so a dashboard or a reconnect can authenticate hundreds at once.
// Only refusals count: guessing page ids produces them, and a client that opens what it may open rarely gets one.
// Signed-in sockets count per user, so an office behind one NAT does not share a budget
export const throttleRefusedAuthentication = <TPayload extends AuthenticatePayload, TResult>(
  authenticate: (payload: TPayload) => Promise<TResult>
) => {
  const refusedAt = new Map<string, number[]>()
  const bannedUntil = new Map<string, number>()
  const pendingCounts = new Map<string, number>()
  const isBanned = (key: string) => (bannedUntil.get(key) ?? 0) > Date.now()
  setInterval(() => {
    const now = Date.now()
    refusedAt.forEach((times, key) => {
      if (times.at(-1)! <= now - REFUSAL_WINDOW) refusedAt.delete(key)
    })
    bannedUntil.forEach((until, key) => {
      if (until <= now) bannedUntil.delete(key)
    })
  }, REFUSAL_WINDOW).unref()

  const recordRefusal = (key: string, {documentName, context}: AuthenticatePayload) => {
    if (isBanned(key)) return
    const now = Date.now()
    const recentTimes = (refusedAt.get(key) ?? []).filter((time) => time > now - REFUSAL_WINDOW)
    recentTimes.push(now)
    if (recentTimes.length < MAX_REFUSALS) {
      refusedAt.set(key, recentTimes)
      return
    }
    refusedAt.delete(key)
    bannedUntil.set(key, now + BAN_DURATION)
    Logger.warn(
      `Yjs: refusing every document for ${ms(BAN_DURATION, {long: true})} after ${MAX_REFUSALS} refusals within ${ms(REFUSAL_WINDOW, {long: true})}`,
      {userId: context.userId, ip: context.ip, tags: {documentName}}
    )
  }

  return async (payload: TPayload) => {
    const {userId, ip} = payload.context
    const key = userId || ip || ''
    const pendingCount = pendingCounts.get(key) ?? 0
    if (isBanned(key) || pendingCount >= MAX_PENDING) throw tooManyRefusals
    pendingCounts.set(key, pendingCount + 1)
    try {
      return await authenticate(payload)
    } catch (error) {
      if (isCountedRefusal(error)) recordRefusal(key, payload)
      throw error
    } finally {
      const remainingCount = pendingCounts.get(key)! - 1
      if (remainingCount > 0) pendingCounts.set(key, remainingCount)
      else pendingCounts.delete(key)
    }
  }
}
