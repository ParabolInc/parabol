import {GQLContext} from './../../graphql'
import AtlassianServerManager from '../../../utils/AtlassianServerManager'
import {getUserId} from '../../../utils/authorization'
import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'

const getCloudIds = async (manager: AtlassianServerManager) => {
  const sites = await manager.getAccessibleResources()
  if ('message' in sites) {
    console.error(sites)
    return null
  }
  return sites.map(({id}) => id)
}

const fetchAtlassianProjects = async (
  teamId: string,
  userId: string,
  {dataLoader, authToken}: GQLContext,
  cloudIds?: string[],
  accessToken?: string
) => {
  const viewerId = getUserId(authToken)
  if (viewerId !== userId) return []
  const token =
    accessToken || (await dataLoader.get('freshAtlassianAuth').load({teamId, userId}))?.accessToken
  if (!token) return []
  const manager = new AtlassianServerManager(token)
  const jiraCloudIds = cloudIds || (await getCloudIds(manager))
  if (!jiraCloudIds) return []
  const projects = await manager.getAllProjects(jiraCloudIds)
  return projects.map((project) => ({
    ...project,
    id: IntegrationRepoId.join({...project, projectKey: project.key, service: 'jira'}),
    teamId,
    userId,
    service: 'jira'
  }))
}

export default fetchAtlassianProjects
