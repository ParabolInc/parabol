import {DataLoaderWorker} from './../../graphql'
import JiraServerRestManager from '../../../integrations/jiraServer/JiraServerRestManager'

const fetchJiraServerProjects = async (
  teamId: string,
  userId: string,
  dataLoader: DataLoaderWorker
) => {
  const token = await dataLoader
    .get('teamMemberIntegrationAuths')
    .load({service: 'jiraServer', teamId, userId})
  if (!token) return []
  const provider = await dataLoader.get('integrationProviders').loadNonNull(token.providerId)

  const manager = new JiraServerRestManager(
    provider.serverBaseUrl,
    provider.consumerKey,
    provider.consumerSecret,
    token.accessToken,
    token.accessTokenSecret
  )
  const projects = await manager.getProjects()
  if (projects instanceof Error) {
    console.log(projects)
    return []
  }
  return projects
    .filter((project) => !project.archived)
    .map((project) => ({...project, service: 'jiraServer'}))
}

export default fetchJiraServerProjects
