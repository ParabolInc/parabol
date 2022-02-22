import DataLoader from 'dataloader'
import RootDataLoader from './RootDataLoader'
import sendToSentry from '../utils/sendToSentry'
import TaskIntegrationManagerFactory from '../integrations/TaskIntegrationManagerFactory'

export interface JiraServerIssueKey {
  teamId: string
  userId: string
  issueId: string
  providerId: string
}

interface JiraServerIssue {
  id: string
  self: string
  key: string
  descriptionHTML: string
  summary: string
  description: string | null
  project: {
    key: string
  }
  type: 'JiraServer'
}

export const jiraServerIssue = (
  parent: RootDataLoader
): DataLoader<JiraServerIssueKey, JiraServerIssue | null, string> => {
  return new DataLoader<JiraServerIssueKey, JiraServerIssue | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, userId, issueId}) => {
          const manager = await TaskIntegrationManagerFactory.initManager(parent, 'jiraServer', {
            teamId: teamId,
            userId
          })

          if (!manager?.getIssue) {
            return null
          }

          const issueRes = await manager.getIssue(issueId)

          if (issueRes instanceof Error) {
            sendToSentry(issueRes, {userId, tags: {issueId, teamId}})
            return null
          }
          return {
            id: issueRes.id,
            self: issueRes.self,
            key: issueRes.key,
            descriptionHTML: issueRes.renderedFields.description,
            ...issueRes.fields,
            type: 'JiraServer'
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
