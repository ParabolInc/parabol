import {User} from '@sentry/node'
import {GraphQLBoolean, GraphQLList, GraphQLString, GraphQLNonNull} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import updateUser from '../../../postgres/queries/updateUser'
import {requireSU} from '../../../utils/authorization'
import db from '../../../db'
import UpdateWatchlistPayload from '../../types/UpdateWatchlistPayload'
import {getUsersByEmails} from '../../../postgres/queries/getUsersByEmails'

const updateWatchlist = {
  type: GraphQLNonNull(UpdateWatchlistPayload),
  description:
    'add/remove user(s) to/from the LogRocket watchlist so that we start/stop recording their sessions',
  args: {
    emails: {
      type: GraphQLList(GraphQLNonNull(GraphQLString)),
      description: `a list of the email addresses of users whose sessions we want to start/stop recording in LogRocket`
    },
    domain: {
      type: GraphQLString,
      description:
        'add/remove the entire domain to/from the LogRocket watchlist. The part of the email after the @'
    },
    includeInWatchlist: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the user should be added to the watchlist, false if not'
    }
  },
  resolve: async (
    _source,
    {
      includeInWatchlist,
      emails,
      domain
    }: {includeInWatchlist: boolean; emails: string[]; domain: string},
    {authToken}
  ) => {
    const r = await getRethink()
    const now = new Date()

    // AUTH
    requireSU(authToken)

    // RESOLUTION
    const users = [] as User[]
    if (emails) {
      const usersByEmail = await getUsersByEmails(emails)
      users.push(...usersByEmail)
    }
    if (domain) {
      const usersByDomain = await r
        .table('User')
        .filter((doc) => (doc as any)('email').match(domain))
        .run()
      users.push(...usersByDomain)
    }
    await db.prime('User', users)
    const userIds = users.map(({id}) => id).filter((id): id is string => !!id)
    if (users.length === 0) {
      return {error: {message: 'No users found matching the email or domain'}}
    }
    const update = {isWatched: includeInWatchlist, updatedAt: now}
    await Promise.all([
      r
        .table('User')
        .getAll(r.args(userIds))
        .update(update)
        .run(),
      updateUser(update, userIds)
    ])

    return {success: true}
  }
}

export default updateWatchlist
