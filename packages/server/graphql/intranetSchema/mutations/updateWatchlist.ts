import {User} from '@sentry/node'
import {GraphQLBoolean, GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql'
import getUsersByDomain from '../../../postgres/queries/getUsersByDomain'
import {getUsersByEmails} from '../../../postgres/queries/getUsersByEmails'
import updateUser from '../../../postgres/queries/updateUser'
import {requireSU} from '../../../utils/authorization'
import {InternalContext} from '../../graphql'
import UpdateWatchlistPayload from '../../types/UpdateWatchlistPayload'

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
    const userIds = users.map(({id}) => id).filter((id): id is string => !!id)
    if (users.length === 0) {
      return {error: {message: 'No users found matching the email or domain'}}
    }
    await updateUser({isWatched: includeInWatchlist}, userIds)

    return {success: true}
  }
}

export default updateWatchlist
