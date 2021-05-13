import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import GitHubSearchQuery from '../../database/types/GitHubSearchQuery'
import updateGitHubSearchQueries from '../../postgres/queries/updateGitHubSearchQueries'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import PersistGitHubSearchQueryPayload from '../types/PersistGitHubSearchQueryPayload'

const persistGitHubSearchQuery = {
  type: GraphQLNonNull(PersistGitHubSearchQueryPayload),
  description: ``,
  args: {
    teamId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'the team witht the settings we add the query to'
    },
    queryString: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The query string as sent to GitHub'
    },
    isRemove: {
      type: GraphQLBoolean,
      description: 'true if this query should be deleted'
    }
  },
  resolve: async (
    _source,
    {teamId, queryString, isRemove},
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
    // MUTATIVE
    const {githubSearchQueries} = githubAuth
    const searchQueryStrings = githubSearchQueries.map(({queryString}) => queryString)
    const existingIdx = searchQueryStrings.indexOf(queryString)
    let isChange = true
    if (existingIdx !== -1) {
      // the search query already exists
      // if remove, then delete it
      // if not, then update the lastUsedAt
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
    } else if (!isRemove) {
      const newQuery = new GitHubSearchQuery({queryString})
      // MUTATIVE
      githubSearchQueries.unshift(newQuery)
      githubSearchQueries.slice(0, MAX_QUERIES)
    }
    const data = {teamId, userId: viewerId}
    if (isChange) {
      await updateGitHubSearchQueries({teamId, userId: viewerId, githubSearchQueries})
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

export default persistGitHubSearchQuery
