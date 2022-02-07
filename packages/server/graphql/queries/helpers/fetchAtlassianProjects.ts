import {GQLContext} from './../../graphql'
import AtlassianServerManager from '../../../utils/AtlassianServerManager'
import {getUserId} from '../../../utils/authorization'

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
    teamId,
    userId
  }))
}

export default fetchAtlassianProjects
