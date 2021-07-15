import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import updateUser from '../../../postgres/queries/updateUser'
import {requireSU} from '../../../utils/authorization'

const updateWatchlist = {
  type: GraphQLBoolean,
  description: 'add a user to the LogRocket watchlist so that their sessions are recorded',
  args: {
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the user to be added to the watchlist'
    },
    includeInWatchlist: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'True if the user should be added to the watchlist, false if not'
    }
  },
  resolve: async (
    _source,
    {includeInWatchlist, userId}: {includeInWatchlist: boolean; userId: string},
    {authToken, dataLoader}
  ) => {
    const r = await getRethink()
    const now = new Date()

    // AUTH
    requireSU(authToken)

    // VALIDATION
    const user = await dataLoader.get('users').load(userId)
    if (!user) throw new Error(`User doesn't exist`)

    // RESOLUTION
    const update = {isWatched: includeInWatchlist, updatedAt: now}
    await Promise.all([
      r
        .table('User')
        .get(userId)
        .update(update)
        .run(),
      updateUser(update, userId)
    ])

    return true
  }
}

export default updateWatchlist
