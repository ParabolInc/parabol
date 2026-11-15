import DataLoader from 'dataloader'
import fetchJiraServerProjects, {
  type JiraServerProject
} from '../integrations/jiraServer/fetchJiraServerProjects'
import JiraServerRestManager, {
  type JiraServerFieldType
} from '../integrations/jiraServer/JiraServerRestManager'
import type {IntegrationProviderJiraServer} from '../postgres/types/IntegrationProvider'
import type RootDataLoader from './RootDataLoader'

export interface JiraServerIssueTypeKey {
  teamId: string
  userId: string
  providerId: number
  issueType: string
  projectId: string
}

type TeamUserKey = {
  teamId: string
  userId: string
}

export const allJiraServerProjects = (parent: RootDataLoader) => {
  return new DataLoader<TeamUserKey, JiraServerProject[], string>(async (keys) => {
    return Promise.all(
      keys.map(async ({userId, teamId}) => {
        const projects = await fetchJiraServerProjects({dataLoader: parent, teamId, userId})
        return projects instanceof Error ? [] : projects
      })
    )
  })
}

export const jiraServerFieldTypes = (parent: RootDataLoader) =>
  new DataLoader<JiraServerIssueTypeKey, JiraServerFieldType[] | null, string>(
    async (keys) => {
      return Promise.all(
        keys.map(async ({teamId, userId, projectId, issueType}) => {
          const auth = await parent
            .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
            .load({service: 'jiraServer', teamId, userId})

          if (!auth) {
            return null
          }

          const provider = await parent.get('integrationProviders').loadNonNull(auth.providerId)
          const manager = new JiraServerRestManager(auth, provider as IntegrationProviderJiraServer)
          const fieldTypes = await manager.getFieldTypes(projectId, issueType)
          return fieldTypes instanceof Error ? null : fieldTypes
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, userId, projectId, issueType}) =>
        `${teamId}:${userId}:${projectId}:${issueType}`
    }
  )
