import {GraphQLResolveInfo} from 'graphql'
import {isNotNull} from 'parabol-client/utils/predicates'
import GitLabServerManager from '../../../integrations/gitlab/GitLabServerManager'
import {GQLContext} from '../../graphql'

const fetchGitLabProjects = async (
  teamId: string,
  userId: string,
  context: GQLContext,
  info: GraphQLResolveInfo
) => {
  const {dataLoader} = context
  const auth = await dataLoader.get('freshGitlabAuth').load({teamId, userId})
  if (!auth?.accessToken) return []
  const {providerId} = auth
  const provider = await dataLoader.get('integrationProviders').load(providerId)
  if (!provider?.serverBaseUrl) return []
  const manager = new GitLabServerManager(auth, context, info, provider.serverBaseUrl)
  const [data, error] = await manager.getProjects({teamId})
  if (error) {
    console.error(error.message)
    return []
  }
  return (
    data.projects?.edges
      ?.map((edge) => edge?.node && {...edge.node, service: 'gitlab'})
      .filter(isNotNull) ?? []
  )
}

export default fetchGitLabProjects
