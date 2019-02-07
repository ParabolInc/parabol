import * as Sentry from '@sentry/node'
import getRethink from '../database/rethinkDriver'

export interface SentryOptions {
  userId?: string
  tags?: {
    [tag: string]: string
  }
}

const sendToSentry = async (error: Error, options: SentryOptions = {}) => {
  const r = getRethink()
  const {userId, tags} = options
  let user
  if (userId) {
    user = await r
      .table('User')
      .get(userId)
      .pluck('id', 'email')
      .default(null)
  }

  Sentry.withScope((scope) => {
    user && scope.setUser(user)
    if (tags) {
      Object.keys((tag) => {
        scope.setTag(tag, tags[tag])
      })
    }
    Sentry.captureException(error)
  })
}

export default sendToSentry
