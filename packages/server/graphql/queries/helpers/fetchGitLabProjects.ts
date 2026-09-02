import type {GraphQLResolveInfo} from 'graphql'
import {isNotNull} from 'parabol-client/utils/predicates'
import GitLabServerManager from '../../../integrations/gitlab/GitLabServerManager'
import type {GQLContext} from '../../graphql'

const fetchGitLabProjects = async (
  teamId: string,
  userId: string,
  context: GQLContext,
  info: GraphQLResolveInfo
) => {
  const {dataLoader} = context
  const auth = await dataLoader.get('freshAuth').load({service: 'gitlab', teamId, userId})
  if (!auth?.accessToken) return []
  const {providerId} = auth
  const provider = await dataLoader.get('integrationProviders').load(providerId)
  if (!provider?.serverBaseUrl)
    return new Error(`GitLab provider ${providerId} has no serverBaseUrl`)
  const manager = new GitLabServerManager(auth, context, info, provider.serverBaseUrl)
  const [data, error] = await manager.getProjects({})
  if (error) return error
  return (
    data.projects?.edges
      ?.map((edge) => edge?.node && {...edge.node, service: 'gitlab' as const})
      .filter(isNotNull) ?? []
  )
}

export default fetchGitLabProjects
