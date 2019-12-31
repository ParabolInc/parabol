import {DataLoaderWorker} from '../../graphql'
import AzureDevopsManager from '../../../utils/AzureDevopsManager'
import {Omit} from 'parabol-client/types/generics'
import {ISuggestedIntegrationAzureDevops} from 'parabol-client/types/graphql'
import makeAzureDevopsProjectName from 'parabol-client/utils/makeAzureDevopsProjectName'
import makeSuggestedIntegrationId from 'parabol-client/utils/makeSuggestedIntegrationId'

const fetchAzureDevopsProjects = async (dataLoader: DataLoaderWorker, teamId, userId) => {
  const [accessToken, auths] = await Promise.all([
    dataLoader.get('freshAzureDevopsAccessToken').load({teamId, userId}),
    dataLoader.get('azureDevopsAuthByUserId').load(userId)
  ])
  const auth = auths.find((auth) => auth.teamId === teamId)
  if (!auth) return []
  // mutate the cache to ensure accessToken is always the same
  auth.accessToken = accessToken

  const manager = new AzureDevopsManager(accessToken)
  const sites = await manager.getAccessibleResources()

  if ('message' in sites) {
    console.error(sites)
    return []
  }

  const organizations = sites.map((site) => site.id)
  const azureDevopsProjects = [] as Omit<
    ISuggestedIntegrationAzureDevops,
    '__typename' | 'remoteProject'
  >[]
  const service = 'azuredevops' as any // TaskServiceEnum.jira
  await manager.getProjects(organizations, (err, res) => {
    if (err) {
      console.error(err)
    } else if (res) {
      const {organization, newProjects} = res
      const newItems = newProjects.map((project) => ({
        // projectId/key is not globally unique, but a organization is
        id: makeSuggestedIntegrationId({
          ...project,
          projectKey: project.key,
          organization,
          service
        }),
        service,
        organizations,
        projectName: makeAzureDevopsProjectName(project.name, sites, organization),
        projectKey: project.key,
        avatar: project.avatarUrls['24x24']
      }))
      azureDevopsProjects.push(...newItems)
    }
  })
  return azureDevopsProjects
}

export default fetchAzureDevopsProjects
