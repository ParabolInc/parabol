import * as Sentry from '@sentry/node'
import {getUserById} from '../postgres/queries/getUsersByIds'

export interface SentryOptions {
  sampleRate?: number
  userId?: string
  ip?: string
  tags?: {
    [tag: string]: string | number
  }
  extras?: Record<string, unknown>
}

// Even though this is a promise we'll never need to await it, so we'll never need to worry about catching an error
const sendToSentry = async (error: Error, options: SentryOptions = {}) => {
  console.trace(
    'SEND TO SENTRY',
    error.message || error?.toString() || JSON.stringify(error),
    JSON.stringify(options.tags),
    JSON.stringify(options.extras)
  )
  const {sampleRate, tags, extras, userId, ip} = options
  if (sampleRate && Math.random() > sampleRate) return
  const fullUser = userId ? await getUserById(userId) : null
  const user = fullUser ? {id: fullUser.id, email: fullUser.email} : null
  if (user && ip) {
    ;(user as any).ip_address = ip
  }
  Sentry.withScope((scope) => {
    user && scope.setUser(user)
    if (tags) {
      Object.keys(tags).forEach((tag) => {
        scope.setTag(tag, String(tags[tag]))
      })
    }
    if (extras) {
      scope.setExtras(extras)
    }
    Sentry.captureException(error)
  })
}

export default sendToSentry
