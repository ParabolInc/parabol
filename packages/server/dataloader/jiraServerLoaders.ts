import DataLoader from 'dataloader'
import JiraServerRestManager, {
  JiraServerFieldType,
  JiraServerRestProject
} from '../integrations/jiraServer/JiraServerRestManager'
import {IntegrationProviderJiraServer} from '../postgres/queries/getIntegrationProvidersByIds'
import getJiraServerDimensionFieldMap, {
  GetJiraServerDimensionFieldMapParams,
  JiraServerDimensionFieldMap
} from '../postgres/queries/getJiraServerDimensionFieldMap'
import sendToSentry from '../utils/sendToSentry'
import RootDataLoader from './RootDataLoader'

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
  issueType: string
  projectId: string
}

export interface JiraServerDimensionFieldKey {
  providerId: number
  teamId: string
  projectId: string
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
  issueType: string
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

export const jiraServerIssue = (parent: RootDataLoader) => {
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
            issueType: issuetype.id,
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

export const allJiraServerProjects = (parent: RootDataLoader) => {
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

export const jiraServerFieldTypes = (parent: RootDataLoader) =>
  new DataLoader<JiraServerIssueTypeKey, JiraServerFieldType[] | null, string>(
    async (keys) => {
      return Promise.all(
        keys.map(async ({teamId, userId, projectId, issueType}) => {
          const auth = await parent
            .get('teamMemberIntegrationAuths')
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

export const jiraServerDimensionFieldMap = (parent: RootDataLoader) =>
  new DataLoader<GetJiraServerDimensionFieldMapParams, JiraServerDimensionFieldMap | null, string>(
    async (keys) => {
      return Promise.all(
        keys.map(async (params) => {
          return getJiraServerDimensionFieldMap(params)
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({providerId, teamId, projectId, issueType, dimensionName}) =>
        `${providerId}:${teamId}:${projectId}:${issueType}:${dimensionName}`
    }
  )
