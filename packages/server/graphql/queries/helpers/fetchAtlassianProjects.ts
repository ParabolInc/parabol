import {JiraProject} from 'parabol-client/utils/AtlassianManager'
import {DataLoaderWorker} from '../../graphql'
import AtlassianServerManager from '../../../utils/AtlassianServerManager'
import makeRepoIntegrationId from 'parabol-client/utils/makeRepoIntegrationId'

export type PickedJiraProject = Pick<JiraProject, 'id' | 'cloudId' | 'teamId' | 'userId'>[]

const fetchAtlassianProjects = async (
  dataLoader: DataLoaderWorker,
  teamId: string,
  userId: string
) => {
  const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId})
  if (!auth) return []
  const {accessToken} = auth
  const manager = new AtlassianServerManager(accessToken)
  const sites = await manager.getAccessibleResources()

  if ('message' in sites) {
    console.error(sites)
    return []
  }

  const cloudIds = sites.map((site) => site.id)
  const atlassianProjects = [] as JiraProject[]
  await manager.getProjects(cloudIds, (err, res) => {
    if (err) {
      console.error(err)
    } else if (res) {
      const {cloudId, newProjects} = res
      const newItems = newProjects.map((project) => {
        // projectId/key is not globally unique, but a cloudId is
        project.id = makeRepoIntegrationId({
          ...project,
          projectKey: project.key,
          cloudId
        })
        project.userId = userId
        project.teamId = teamId
        project.cloudId = cloudId
        return project
      })
      atlassianProjects.push(...newItems)
    }
  })
  return atlassianProjects
}

export default fetchAtlassianProjects
