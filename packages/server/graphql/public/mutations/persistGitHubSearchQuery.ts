import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const persistGitHubSearchQuery: MutationResolvers['persistGitHubSearchQuery'] = async (
  _source,
  {teamId, queryString, isRemove},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const MAX_QUERIES = 5

  // AUTH
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
      queryToUpdate.lastUsedAt = new Date().toJSON()
      githubSearchQueries.sort((a, b) => (a.lastUsedAt > b.lastUsedAt ? -1 : 1))
      if (githubSearchQueries[existingIdx] === queryToUpdate) {
        isChange = false
      }
    }
  } else {
    if (!isRemove) {
      const newQuery = {
        lastUsedAt: new Date().toJSON(),
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
    await getKysely()
      .updateTable('GitHubAuth')
      .set({githubSearchQueries: githubSearchQueries.map((obj) => JSON.stringify(obj))})
      .where('teamId', '=', teamId)
      .where('userId', '=', viewerId)
      .execute()
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

export default persistGitHubSearchQuery
