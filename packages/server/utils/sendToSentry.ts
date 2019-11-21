import * as Sentry from '@sentry/node'
import getRethink from '../database/rethinkDriver'
import User from '../database/types/User'

export interface SentryOptions {
  userId?: string
  tags?: {
    [tag: string]: string
  }
}

const __PROD__ = process.env.NODE_ENV === 'production'
// Even though this is a promise we'll never need to await it, so we'll never need to worry about catching an error
// @ts-ignore
const sendToSentry = async (error: Error, options: SentryOptions = {}): void => {
  if (!__PROD__) {
    console.error(error)
  }
  const r = await getRethink()
  const {userId} = options
  const user = userId
    ? ((await r
        .table('User')
        .get(userId)
        .default({})
        .pluck('id', 'email')
        .run()) as User | null)
    : null

  Sentry.withScope((scope) => {
    user && scope.setUser(user)
    // if (tags) {
    //   Object.keys(tags).forEach((tag) => {
    //     scope.setTag(tag, tags[tag])
    //   })
    // }
    Sentry.captureException(error)
  })
}

export default sendToSentry
