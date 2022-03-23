import DataLoader from 'dataloader'
import JiraServerRestManager, {
  JiraServerRestProject
} from '../integrations/jiraServer/JiraServerRestManager'
import RootDataLoader from './RootDataLoader'
import sendToSentry from '../utils/sendToSentry'
import JiraServerTaskIntegrationManager from '../integrations/JiraServerTaskIntegrationManager'
import {IntegrationProviderJiraServer} from '../postgres/queries/getIntegrationProvidersByIds'

export interface JiraServerIssueKey {
  teamId: string
  userId: string
  issueId: string
  providerId: number
}

interface JiraServerIssue {
  id: string
  self: string
  issueKey: string
  descriptionHTML: string
  summary: string
  description: string | null
  project: {
    key: string
  }
  service: 'jiraServer'
}

type TeamUserKey = {
  teamId: string
  userId: string
}

export type JiraServerProject = JiraServerRestProject & {
  service: 'jiraServer'
  providerId: number
}

export const jiraServerIssue = (
  parent: RootDataLoader
): DataLoader<JiraServerIssueKey, JiraServerIssue | null, string> => {
  return new DataLoader<JiraServerIssueKey, JiraServerIssue | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, userId, issueId}) => {
          const auth = await parent
            .get('teamMemberIntegrationAuths')
            .load({service: 'jiraServer', teamId, userId})

          if (!auth) {
            return null
          }

          const provider = await parent.get('integrationProviders').loadNonNull(auth.providerId)

          if (!provider) {
            return null
          }

          const manager = new JiraServerTaskIntegrationManager(
            auth,
            provider as IntegrationProviderJiraServer
          )

          const issueRes = await manager.getIssue(issueId)

          if (issueRes instanceof Error) {
            sendToSentry(issueRes, {userId, tags: {issueId, teamId}})
            return null
          }
          return {
            id: issueRes.id,
            self: issueRes.self,
            issueKey: issueRes.key,
            descriptionHTML: issueRes.renderedFields.description,
            ...issueRes.fields,
            service: 'jiraServer' as const
          }
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : null))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({issueId, providerId}) => `${issueId}:${providerId}`
    }
  )
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
