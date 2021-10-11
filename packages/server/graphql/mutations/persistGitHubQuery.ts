import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import updateGitHubSearchQueries from '../../postgres/queries/updateGitHubSearchQueries'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import PersistGitHubQueryPayload from '../types/PersistGitHubQueryPayload'

const persistGitHubQuery = {
  type: GraphQLNonNull(PersistGitHubQueryPayload),
  description: `Add a persisted github query string to a team`,
  args: {
    teamId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'the team with the settings we add the query to'
    },
    input: {
      type: GraphQLNonNull(GraphQLString),
      description: 'the search query to persist (or remove, if isRemove is true)'
    },
    isRemove: {
      type: GraphQLBoolean,
      description: 'if true, remove the input from the list of persisted queries'
    }
  },
  resolve: async (
    _source,
    {teamId, input, isRemove}: {teamId: string; input: string; isRemove: boolean | null},
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
    const normalizedQueryString = input.toLowerCase().trim()
    const existingIdx = githubSearchQueries.findIndex(
      (query) => query.queryString === normalizedQueryString
    )
    let isChange = true
    if (existingIdx !== -1) {
      if (isRemove) {
        // MUTATIVE
        githubSearchQueries.splice(existingIdx, 1)
      } else {
        const queryToUpdate = githubSearchQueries[existingIdx]
        // MUTATIVE
        queryToUpdate.lastUsedAt = new Date()
        githubSearchQueries.sort((a, b) => (a.lastUsedAt > b.lastUsedAt ? -1 : 1))
        if (githubSearchQueries[existingIdx] === queryToUpdate) {
          isChange = false
        }
      }
    } else {
      if (!isRemove) {
        const newQuery = {lastUsedAt: new Date(), queryString: normalizedQueryString}
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
        'PersistJiraSearchQuerySuccess',
        data,
        subOptions
      )
    }
    return data
  }
}

export default persistGitHubQuery
