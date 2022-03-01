import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import generateUID from '../../generateUID'
import updateGitHubSearchQueries from '../../postgres/queries/updateGitHubSearchQueries'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import PersistGitHubSearchQueryPayload from '../types/PersistGitHubSearchQueryPayload'

const persistGitHubSearchQuery = {
  type: new GraphQLNonNull(PersistGitHubSearchQueryPayload),
  description: ``,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the team witht the settings we add the query to'
    },
    queryString: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The query string as sent to GitHub'
    },
    isRemove: {
      type: GraphQLBoolean,
      description: 'true if this query should be deleted'
    }
  },
  resolve: async (
    _source: unknown,
    {
      teamId,
      queryString,
      isRemove
    }: {teamId: string; queryString: string; isRemove?: boolean | null},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const MAX_QUERIES = 5

    //AUTH
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: `Not on team`}}
    }
    const githubAuth = await dataLoader.get('githubAuth').load({teamId, userId: viewerId})
    if (!githubAuth) {
      return {error: {message: 'Not integrated with GitHub'}}
    }

    // RESOLUTION
    const {githubSearchQueries} = githubAuth
    const normalizedQueryString = queryString.toLowerCase().trim()
    const existingIdx = githubSearchQueries.findIndex(
      (query) => query.queryString === normalizedQueryString
    )
    let isChange = true
    if (existingIdx !== -1) {
      if (isRemove) {
        // MUTATIVE
        githubSearchQueries.splice(existingIdx, 1)
      } else {
        const queryToUpdate = githubSearchQueries[existingIdx]!
        // MUTATIVE
        queryToUpdate.lastUsedAt = new Date()
        githubSearchQueries.sort((a, b) => (a.lastUsedAt > b.lastUsedAt ? -1 : 1))
        if (githubSearchQueries[existingIdx] === queryToUpdate) {
          isChange = false
        }
      }
    } else {
      if (!isRemove) {
        const newQuery = {
          lastUsedAt: new Date(),
          queryString: normalizedQueryString,
          id: generateUID()
        }
        // MUTATIVE
        githubSearchQueries.unshift(newQuery)
        githubSearchQueries.slice(0, MAX_QUERIES)
      } else {
        isChange = false
      }
    }
    const data = {teamId, userId: viewerId}
    if (isChange) {
      await updateGitHubSearchQueries({githubSearchQueries, teamId, userId: viewerId})
      publish(
        SubscriptionChannel.NOTIFICATION,
        viewerId,
        'PersistGitHubSearchQuerySuccess',
        data,
        subOptions
      )
    }
    return data
  }
}

export default persistGitHubSearchQuery
