import {User} from '@sentry/node'
import {GraphQLBoolean, GraphQLList, GraphQLString, GraphQLNonNull} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import updateUser from '../../../postgres/queries/updateUser'
import {requireSU} from '../../../utils/authorization'
import db from '../../../db'
import UpdateWatchlistPayload from '../../types/UpdateWatchlistPayload'
import {InternalContext} from '../../graphql'
import {getUsersByEmails} from '../../../postgres/queries/getUsersByEmails'
import getUsersByDomain from '../../../postgres/queries/getUsersByDomain'

const updateWatchlist = {
  type: new GraphQLNonNull(UpdateWatchlistPayload),
  description:
    'add/remove user(s) to/from the LogRocket watchlist so that we start/stop recording their sessions',
  args: {
    emails: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      description: `a list of email addresses of users whose sessions we want to start/stop recording in LogRocket`
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
    _source: unknown,
    {
      includeInWatchlist,
      emails,
      domain
    }: {includeInWatchlist: boolean; emails: string[]; domain: string},
    {authToken}: InternalContext
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
      const usersByDomain = await getUsersByDomain(domain)
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
      updateUser(update, userIds),
      db.writeMany('User', userIds, update)
    ])

    return {success: true}
  }
}

export default updateWatchlist
