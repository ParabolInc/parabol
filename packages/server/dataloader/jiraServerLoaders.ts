import DataLoader from 'dataloader'
import JiraServerRestManager, {
  JiraServerRestProject
} from '../integrations/jiraServer/JiraServerRestManager'
import RootDataLoader from './RootDataLoader'

type TeamUserKey = {
  teamId: string
  userId: string
}

export type JiraServerProject = JiraServerRestProject & {
  service: 'jiraServer'
  providerId: number
}

export const allJiraServerProjects = (
  parent: RootDataLoader
): DataLoader<TeamUserKey, JiraServerProject[], string> => {
  return new DataLoader<TeamUserKey, JiraServerProject[], string>(async (keys) => {
    return Promise.all(
      keys.map(async ({userId, teamId}) => {
        const token = await parent
          .get('teamMemberIntegrationAuths')
          .load({service: 'jiraServer', teamId, userId})
        if (!token) return []
        const provider = await parent.get('integrationProviders').loadNonNull(token.providerId)

        const manager = new JiraServerRestManager(
          provider.serverBaseUrl!,
          provider.consumerKey!,
          provider.consumerSecret!,
          token.accessToken!,
          token.accessTokenSecret!
        )
        const projects = await manager.getProjects()
        if (projects instanceof Error) {
          return []
        }
        return projects
          .filter((project) => !project.archived)
          .map((project) => ({
            ...project,
            service: 'jiraServer' as const,
            providerId: provider.id
          }))
      })
    )
  })
}
