import {GraphQLNonNull, GraphQLResolveInfo} from 'graphql'
import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import {getUserId} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import RepoIntegrationQueryPayload from '../types/RepoIntegrationQueryPayload'
import fetchAllIntegrations from './helpers/fetchAllIntegrations'
import {getPermsByTaskService, getUserIntegrations} from './helpers/repoIntegrationHelpers'

export default {
  description: 'The integrations that the user would probably like to use',
  type: new GraphQLNonNull(RepoIntegrationQueryPayload),
  resolve: async (
    {teamId, userId}: {teamId: string; userId: string},
    {first = 10}: {first?: number},
    context: GQLContext,
    info: GraphQLResolveInfo
  ) => {
    const {authToken, dataLoader} = context
    const viewerId = getUserId(authToken)

    // AUTH
    if (userId !== viewerId) {
      const user = await dataLoader.get('users').load(userId)
      const {tms} = user!
      const onTeam = authToken.tms.find((teamId) => tms!.includes(teamId))
      if (!onTeam) {
        return standardError(new Error('Not on same team as user'), {userId: viewerId})
      }
    }
    const permLookup = await getPermsByTaskService(dataLoader, teamId, userId)
    const [userIntegrations, repos] = await Promise.all([
      getUserIntegrations(userId, teamId, permLookup),
      fetchAllIntegrations(teamId, userId, context, info)
    ])
    const userIntegrationIds = new Set<string>()
    userIntegrations.forEach((integration) => {
      const integrationId = IntegrationRepoId.join(integration)
      if (!integrationId) return
      userIntegrationIds.add(integrationId)
    })
    // always have lastUsedAt be a Date (to make the sort easier below)
    const reposWithLastUsedAt = repos.map((repo) => {
      if (userIntegrationIds.has(repo.id)) {
        const existingIntegration = userIntegrations.find((integration) => {
          const integrationId = IntegrationRepoId.join(integration)
          return repo.id === integrationId
        })
        return {
          ...repo,
          lastUsedAt: existingIntegration?.lastUsedAt || new Date(0)
        }
      }
      return {
        ...repo,
        lastUsedAt: new Date(0)
      }
    })

    reposWithLastUsedAt.sort((a, b) =>
      a.lastUsedAt > b.lastUsedAt
        ? -1
        : a.service < b.service
        ? -1
        : a.id.toLowerCase() < b.id.toLowerCase()
        ? -1
        : 1
    )

    if (reposWithLastUsedAt.length > first) {
      return {hasMore: true, items: reposWithLastUsedAt.slice(0, first)}
    } else {
      return {hasMore: false, items: reposWithLastUsedAt}
    }
  }
}
