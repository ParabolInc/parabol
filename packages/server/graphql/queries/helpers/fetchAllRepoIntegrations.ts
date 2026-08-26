import type {GraphQLResolveInfo} from 'graphql'
import interleave from '../../../integrations/platform/interleave'
import type {RemoteRepoIntegration} from '../../../integrations/platform/RemoteRepoIntegration'
import {serverIntegrations} from '../../../integrations/platform/registry'
import logError from '../../../utils/logError'
import type {GQLContext} from '../../graphql'

const fetchAllRepoIntegrations = async (
  teamId: string,
  userId: string,
  context: GQLContext,
  info: GraphQLResolveInfo
) => {
  const ctx = {dataLoader: context.dataLoader, teamId, userId, context, info}
  const definitions = Object.values(serverIntegrations)
  const results = await Promise.allSettled(
    definitions.map((definition) => definition.capabilities.repoList.fetchRepos(ctx))
  )
  const repoLists = results.map((result, idx): RemoteRepoIntegration[] => {
    if (result.status === 'fulfilled') return result.value
    const error = result.reason instanceof Error ? result.reason : new Error(String(result.reason))
    logError(error, {userId, tags: {teamId, service: definitions[idx]!.service}})
    return []
  })
  return interleave(repoLists)
}

export default fetchAllRepoIntegrations
