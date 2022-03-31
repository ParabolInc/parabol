import {GQLContext} from '../../graphql'
import {GraphQLResolveInfo} from 'graphql'
import {GetProjectsQuery} from '../../../types/gitlabTypes'
import {DataLoaderWorker} from '../../graphql'
import getProjects from '../../nestedSchema/GitLab/queries/getProjects.graphql'
import GitLabServerManager from '../../../integrations/gitlab/GitLabServerManager'
import {isNotNull} from 'parabol-client/utils/predicates'

const fetchGitLabProjects = async (
  teamId: string,
  userId: string,
  dataLoader: DataLoaderWorker,
  context: GQLContext,
  info: GraphQLResolveInfo
) => {
  const auth = await dataLoader
    .get('teamMemberIntegrationAuths')
    .load({service: 'gitlab', teamId, userId})
  if (!auth?.accessToken) return []
  const {accessToken, providerId} = auth
  const provider = await dataLoader.get('integrationProviders').load(providerId)
  if (!provider?.serverBaseUrl) return []
  const manager = new GitLabServerManager(accessToken, provider.serverBaseUrl)
  const gitlabRequest = manager.getGitLabRequest(info, context)
  const [data, error] = await gitlabRequest<GetProjectsQuery>(getProjects, {teamId})
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
