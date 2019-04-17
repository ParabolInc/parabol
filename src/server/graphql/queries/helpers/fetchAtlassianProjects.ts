import {DataLoaderWorker} from 'server/graphql/graphql'
import AtlassianManager from 'server/utils/AtlassianManager'
import {Omit} from 'types/generics'
import {ISuggestedIntegrationJira} from 'universal/types/graphql'

const getProjectName = (projectName, sites, cloudId) => {
  if (sites.length === 1) return projectName
  const site = sites.find((site) => site.id === cloudId)
  return `${site.name}/${projectName}`
}

const fetchAtlassianProjects = async (dataLoader: DataLoaderWorker, teamId, userId) => {
  const [accessToken, auths] = await Promise.all([
    dataLoader.get('freshAtlassianAccessToken').load({teamId, userId}),
    dataLoader.get('atlassianAuthByUserId').load(userId)
  ])
  const auth = auths.find((auth) => auth.teamId === teamId)
  if (!auth) return []
  // mutate the cache to ensure accessToken is always the same
  auth.accessToken = accessToken

  const manager = new AtlassianManager(accessToken)
  const sites = await manager.getAccessibleResources()

  if ('message' in sites) {
    console.error(sites)
    return []
  }

  const cloudIds = sites.map((site) => site.id)
  const atlassianProjects = [] as Omit<ISuggestedIntegrationJira, '__typename' | 'remoteProject'>[]
  await manager.getProjects(cloudIds, (err, res) => {
    if (err) {
      console.error(err)
    } else if (res) {
      const {cloudId, newProjects} = res
      const newItems = newProjects.map((project) => ({
        id: project.id,
        service: 'jira' as any, // TaskServiceEnum.jira
        cloudId,
        projectName: getProjectName(project.name, sites, cloudId),
        projectKey: project.key,
        avatar: project.avatarUrls['24x24']
      }))
      atlassianProjects.push(...newItems)
    }
  })
  return atlassianProjects
}

export default fetchAtlassianProjects
