// @flow
import getRethink from 'server/database/rethinkDriver'
import {getUserId} from 'server/utils/authorization'
import Sentry from '@sentry/node'

type DataloaderData = {
  key: string,
  keys: Array<string>,
  indexedResults: Map<string, any>
}

type GraphQLData = {
  query: string,
  variables?: {[name: string]: any},
  firstError?: any
}

type MembershipData = {
  teamId: string
}

type Data = DataloaderData | GraphQLData | MembershipData

type Breadcrumb = {
  message: string,
  category: string,
  data: Data
}

type AuthToken = {
  sub: string
}

const sendSentryEvent = async (authToken?: AuthToken, breadcrumb?: Breadcrumb, error?: Object) => {
  if (process.env.NODE_ENV !== 'production') {
    if (breadcrumb && breadcrumb.data && breadcrumb.data.firstError) {
      console.error(breadcrumb.data.firstError)
    } else if (error) {
      console.error(error)
    } else {
      console.error(JSON.stringify(breadcrumb))
    }
    return
  }
  const r = getRethink()
  let user
  if (authToken) {
    const userId = getUserId(authToken)
    user = await r
      .table('User')
      .get(userId)
      .pluck('id', 'email', 'preferredName')
      .default(null)
  }
  Sentry.configureScope((scope) => {
    if (user) {
      scope.setUser(user)
    }
  })
  if (breadcrumb) {
    Sentry.addBreadcrumb(breadcrumb)
  }
  const event = error || (breadcrumb && new Error(breadcrumb.message)) || new Error('Unknown Error')
  Sentry.captureException(event)
}

export default sendSentryEvent
