import {GQLContext} from '../../graphql'
import {GraphQLResolveInfo} from 'graphql'
// import {GetRepositoriesQuery} from '../../../types/gitlabTypes'
// import getGitLabRequest from '../../../utils/getGitLabRequest'
// import getRepositories from '../../../utils/gitlabQueries/getRepositories.graphql'
import {DataLoaderWorker} from '../../graphql'
import getProjects from '../../../utils/gitlabQueries/getProjects.graphql'
import GitLabServerManager from '../../../integrations/gitlab/GitLabServerManager'

export interface GitLabRepo {
  id: string
  nameWithOwner: string
  hasIssuesEnabled?: boolean
  service: 'gitlab'
}

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
  const manager = new GitLabServerManager(accessToken, provider.serverBaseUrl)
  const gitlabRequest = manager.getGitLabRequest(info, context)
  const [data, error] = await gitlabRequest(getProjects, {teamId})
  if (error) {
    console.error(error.message)
    return []
  }
  const projects = [] as {
    __typename: '_xGitLabProject'
    id: string
    service: 'gitlab'
    fullPath: string
  }[]
  data.projects.edges.forEach((edge) => {
    if (!edge) return
    const {node} = edge
    if (!node) return
    const {id, fullPath} = node
    projects.push({
      __typename: '_xGitLabProject',
      id,
      service: 'gitlab',
      fullPath
    })
  })
  return projects
}

export default fetchGitLabRepos
