import type {JiraServerProject} from '../../dataloader/jiraServerLoaders'
import type {IntegrationProviderJiraServer} from '../../postgres/types/IntegrationProvider'
import type {RepoFetchCtx} from '../platform/ServerIntegrationDefinition'
import JiraServerRestManager from './JiraServerRestManager'

/** Every unarchived Jira Server project; an Error when the remote failed */
const fetchJiraServerProjects = async ({
  dataLoader,
  teamId,
  userId
}: RepoFetchCtx): Promise<JiraServerProject[] | Error> => {
  const auth = await dataLoader
    .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
    .load({service: 'jiraServer', teamId, userId})
  if (!auth) return []
  const provider = await dataLoader.get('integrationProviders').loadNonNull(auth.providerId)
  const manager = new JiraServerRestManager(auth, provider as IntegrationProviderJiraServer)
  const projects = await manager.getProjects()
  if (projects instanceof Error) return projects
  return projects
    .filter((project) => !project.archived)
    .map((project) => ({
      ...project,
      service: 'jiraServer' as const,
      providerId: provider.id,
      userId,
      teamId
    }))
}

export default fetchJiraServerProjects
