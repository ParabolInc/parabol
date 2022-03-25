import {GQLContext} from '../../graphql'
import {GraphQLResolveInfo} from 'graphql'
import {GetProjectsQuery} from '../../../types/gitlabTypes'
import {DataLoaderWorker} from '../../graphql'
import getProjects from '../../nestedSchema/GitLab/queries/getProjects.graphql'
import GitLabServerManager from '../../../integrations/gitlab/GitLabServerManager'

const fetchGitLabRepos = async (
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
  const projects = [] as {
    id: string
    service: 'gitlab'
    fullPath: string
  }[]
  data.projects?.edges?.forEach((edge) => {
    if (!edge) return
    const {node} = edge
    if (!node) return
    const {id, fullPath} = node
    projects.push({
      id,
      service: 'gitlab',
      fullPath
    })
  })
  return projects
}

export default fetchGitLabRepos
