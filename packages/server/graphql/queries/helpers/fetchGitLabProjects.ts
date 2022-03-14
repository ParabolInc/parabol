import {GQLContext} from '../../graphql'
import {GraphQLResolveInfo} from 'graphql'
// import {GetRepositoriesQuery} from '../../../types/gitlabTypes'
import getGitLabRequest from '../../../utils/getGitLabRequest'
// import getRepositories from '../../../utils/gitlabQueries/getRepositories.graphql'
import {DataLoaderWorker} from '../../graphql'
import getProjects from '../../../utils/gitlabQueries/getProjects.graphql'

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
  const {accessToken} = auth
  const gitlabRequest = getGitLabRequest(info, context, {accessToken})
  // const [data, error] = await gitlabRequest<GetRepositoriesQuery>(getProjects)
  const [data, error] = await gitlabRequest(getProjects, {teamId})
  if (error) {
    console.error(error.message)
    return []
  }
  return data.projects.edges.map((edge) => {
    const {node} = edge
    const {id, fullPath} = node
    return {
      __typename: '_xGitLabProject',
      id,
      fullPath,
      service: 'gitlab'
    }
  })
}

export default fetchGitLabRepos
