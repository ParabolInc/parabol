import JiraProjectId from 'parabol-client/shared/gqlIds/JiraProjectId'
import {GQLContext} from '../../graphql'
import {GraphQLResolveInfo} from 'graphql'
import fetchGitHubRepos from './fetchGitHubRepos'
import {JiraProject} from 'parabol-client/utils/AtlassianManager'

const fetchAllRepoIntegrations = async (
  teamId: string,
  userId: string,
  context: GQLContext,
  info: GraphQLResolveInfo
) => {
  const {dataLoader} = context
  const [jiraProjectsRes, githubRepos] = await Promise.all([
    dataLoader.get('fetchAtlassianProjects').load({teamId, userId}),
    fetchGitHubRepos(teamId, userId, dataLoader, context, info)
  ])
  const jiraProjects = jiraProjectsRes.map((project: JiraProject & {cloudId: string}) => ({
    ...project,
    id: JiraProjectId.join(project.cloudId, project.key),
    teamId,
    userId
  }))
  const getValue = (item) => (item.nameWithOwner || item.name).toLowerCase()
  return [...jiraProjects, ...githubRepos].sort((a, b) => {
    return getValue(a) < getValue(b) ? -1 : 1
  })
}

export default fetchAllRepoIntegrations
