import DataLoader from 'dataloader'
import JiraServerRestManager, {
  JiraServerRestProject,
  JiraServerFieldType
} from '../integrations/jiraServer/JiraServerRestManager'
import RootDataLoader from './RootDataLoader'
import sendToSentry from '../utils/sendToSentry'
import {IntegrationProviderJiraServer} from '../postgres/queries/getIntegrationProvidersByIds'
import getJiraServerDimensionFieldMap, {JiraServerDimensionFieldMap} from '../postgres/queries/getJiraServerDimensionFieldMap'

export interface JiraServerIssueKey {
  teamId: string
  userId: string
  issueId: string
  providerId: number
}

export interface JiraServerIssueTypeKey {
  teamId: string
  userId: string
  providerId: number
  issueTypeId: string
  projectId: string
}

export interface JiraServerDimensionFieldKey {
  providerId: number,
  teamId: string,
  projectId: string,
  dimensionName: string
}

export interface JiraServerIssue {
  id: string
  providerId: number
  self: string
  issueKey: string
  descriptionHTML: string
  summary: string
  description: string | null
  projectId: string
  projectKey: string
  issueTypeId: string
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
) => {
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
          const manager = new JiraServerRestManager(auth, provider as IntegrationProviderJiraServer)

          const issue = await manager.getIssue(issueId)

          if (issue instanceof Error) {
            sendToSentry(issue, {userId, tags: {issueId, teamId}})
            return null
          }
          const {project, issuetype, summary, description} = issue.fields
          return {
            ...issue,
            providerId: provider.id,
            issueKey: issue.key,
            descriptionHTML: issue.renderedFields.description,
            projectId: project.id,
            projectKey: project.key,
            issueTypeId: issuetype.id,
            summary,
            description,
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
) => {
  return new DataLoader<TeamUserKey, JiraServerProject[], string>(async (keys) => {
    return Promise.all(
      keys.map(async ({userId, teamId}) => {
        const auth = await parent
          .get('teamMemberIntegrationAuths')
          .load({service: 'jiraServer', teamId, userId})
        if (!auth) return []
        const provider = await parent.get('integrationProviders').loadNonNull(auth.providerId)

        const manager = new JiraServerRestManager(auth, provider as IntegrationProviderJiraServer)
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

export const jiraServerFieldTypes = (
  parent: RootDataLoader
) => new DataLoader<JiraServerIssueTypeKey, JiraServerFieldType[] | null, string>(async (keys) => {
    return Promise.all(
      keys.map(async ({teamId, userId, projectId, issueTypeId}) => {
        const auth = await parent
          .get('teamMemberIntegrationAuths')
          .load({service: 'jiraServer', teamId, userId})

        if (!auth) {
          return null
        }

        const provider = await parent.get('integrationProviders').loadNonNull(auth.providerId)
        const manager = new JiraServerRestManager(auth, provider as IntegrationProviderJiraServer)
        const fieldTypes = await manager.getFieldTypes(projectId, issueTypeId)
        return fieldTypes instanceof Error ? null : fieldTypes
      })
    )
  },
  {
    ...parent.dataLoaderOptions,
    cacheKeyFn: ({teamId, userId, projectId, issueTypeId}) => `${teamId}:${userId}:${projectId}:${issueTypeId}`
  }
)

export const jiraServerDimensionFieldMap = (
  parent: RootDataLoader
) => new DataLoader<JiraServerDimensionFieldKey, JiraServerDimensionFieldMap | null, string>(async (keys) => {
    return Promise.all(
      keys.map(async ({providerId, teamId, projectId, dimensionName}) => {
        return getJiraServerDimensionFieldMap(providerId, teamId, projectId, dimensionName)
      })
    )
  },
  {
    ...parent.dataLoaderOptions,
    cacheKeyFn: ({providerId, teamId, projectId, dimensionName}) => `${providerId}:${teamId}:${projectId}:${dimensionName}`
  }
)

