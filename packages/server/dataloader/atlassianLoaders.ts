import DataLoader from 'dataloader'
import {decode} from 'jsonwebtoken'
import JiraIssueId from 'parabol-client/shared/gqlIds/JiraIssueId'
import JiraProjectId from 'parabol-client/shared/gqlIds/JiraProjectId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {RateLimitError} from 'parabol-client/utils/AtlassianManager'
import getKysely from '../postgres/getKysely'
import upsertAtlassianAuths from '../postgres/queries/upsertAtlassianAuths'
import {selectAtlassianAuth, selectJiraDimensionFieldMap} from '../postgres/select'
import type {AtlassianAuth, JiraDimensionFieldMap} from '../postgres/types'
import AtlassianServerManager, {type JiraProject} from '../utils/AtlassianServerManager'
import {getIssue, type TransformedJiraIssue} from '../utils/atlassian/jiraIssues'
import logError from '../utils/logError'
import publish from '../utils/publish'
import type RootDataLoader from './RootDataLoader'

type TeamUserKey = {
  teamId: string
  userId: string
}
export interface JiraRemoteProjectKey {
  userId: string
  teamId: string
  cloudId: string
  projectKey: string
}

export interface JiraIssueKey {
  teamId: string
  userId: string
  cloudId: string
  issueKey: string
  viewerId: string
  taskId?: string
}

export const freshAtlassianAuth = (
  parent: RootDataLoader
): DataLoader<TeamUserKey, AtlassianAuth | null, string> => {
  return new DataLoader<TeamUserKey, AtlassianAuth | null, string>(
    async (keys) => {
      const pg = getKysely()
      const results = await Promise.allSettled(
        keys.map(async ({userId, teamId}) => {
          const userAtlassianAuths = await selectAtlassianAuth()
            .where('userId', '=', userId)
            .where('isActive', '=', true)
            .execute()
          const atlassianAuthToRefresh = userAtlassianAuths.find(
            (atlassianAuth) => atlassianAuth.teamId === teamId
          )
          if (!atlassianAuthToRefresh) {
            return null
          }

          const {accessToken: existingAccessToken, refreshToken} = atlassianAuthToRefresh
          const decodedToken = existingAccessToken && (decode(existingAccessToken) as any)
          const now = new Date()
          const inAMinute = Math.floor((now.getTime() + 60000) / 1000)
          if (!decodedToken || decodedToken.exp < inAMinute) {
            const oauthRes = await AtlassianServerManager.refresh(refreshToken)
            if (oauthRes instanceof Error) {
              // If we can't refresh it, it's broken. mark it inactive
              if (oauthRes.message === 'refresh_token is invalid') {
                await pg
                  .updateTable('AtlassianAuth')
                  .set({isActive: false})
                  .where('userId', '=', userId)
                  .where('teamId', '=', teamId)
                  .where('isActive', '=', true)
                  .execute()
              }
              logError(oauthRes)
              return null
            }
            const {accessToken, refreshToken: newRefreshToken} = oauthRes
            const updatedRefreshToken = newRefreshToken ?? atlassianAuthToRefresh.refreshToken
            // if user integrated the same Jira account with using different teams we need to update them as well
            // reference: https://github.com/ParabolInc/parabol/issues/5601
            const updatedSameJiraAccountAtlassianAuths = userAtlassianAuths
              .filter((auth) => auth.accountId === atlassianAuthToRefresh.accountId)
              .map((auth) => ({
                ...auth,
                accessToken,
                refreshToken: updatedRefreshToken
              }))
            await upsertAtlassianAuths(updatedSameJiraAccountAtlassianAuths)

            return {
              ...atlassianAuthToRefresh,
              accessToken,
              refreshToken: updatedRefreshToken
            }
          }

          return atlassianAuthToRefresh
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : null))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.userId}:${key.teamId}`
    }
  )
}

export interface JiraGQLProject extends JiraProject {
  cloudId: string
  teamId: string
  userId: string
  service: 'jira'
}
export const allJiraProjects = (
  parent: RootDataLoader
): DataLoader<TeamUserKey, JiraGQLProject[], string> => {
  return new DataLoader<TeamUserKey, JiraGQLProject[], string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({userId, teamId}) => {
          const auth = await parent.get('freshAtlassianAuth').load({teamId, userId})
          if (!auth) return []
          const cloudNameLookup = await parent
            .get('atlassianCloudNameLookup')
            .load({teamId, userId})
          const cloudIds = Object.keys(cloudNameLookup)
          const {accessToken} = auth
          const manager = new AtlassianServerManager(accessToken)
          const projects = await manager.getAllProjects(cloudIds)
          return projects.map((project) => ({
            ...project,
            id: JiraProjectId.join(project.cloudId, project.key),
            userId,
            teamId,
            service: 'jira' as const
          }))
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : []))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.teamId}:${key.userId}`
    }
  )
}

export const jiraRemoteProject = (
  parent: RootDataLoader
): DataLoader<JiraRemoteProjectKey, JiraProject | null, string> => {
  return new DataLoader<JiraRemoteProjectKey, JiraProject | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({userId, teamId, cloudId, projectKey}) => {
          const auth = await parent.get('freshAtlassianAuth').load({teamId, userId})
          if (!auth) return null
          const {accessToken} = auth
          const manager = new AtlassianServerManager(accessToken)
          const projectRes = await manager.getProject(cloudId, projectKey)
          if (projectRes instanceof Error) {
            logError(projectRes, {userId, tags: {teamId, projectKey}})
            return null
          }
          return projectRes
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : null))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.projectKey}:${key.cloudId}`
    }
  )
}

export type JiraIssue = TransformedJiraIssue & {
  teamId: string
  userId: string
}

export const jiraIssue = (
  parent: RootDataLoader
): DataLoader<JiraIssueKey, JiraIssue | null, string> => {
  return new DataLoader<JiraIssueKey, JiraIssue | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, userId, cloudId, issueKey, taskId, viewerId}) => {
          const [auth, estimates] = await Promise.all([
            parent.get('freshAtlassianAuth').load({teamId, userId}),
            taskId ? parent.get('latestTaskEstimates').load(taskId) : []
          ])
          if (!auth) return null
          const {accessToken} = auth
          const manager = new AtlassianServerManager(accessToken)

          const onStaleCache = (freshIssue: TransformedJiraIssue) => {
            const issue: JiraIssue = {
              ...freshIssue,
              teamId,
              userId
            }
            publish(SubscriptionChannel.NOTIFICATION, viewerId, 'JiraIssue', issue)
          }

          const issueRes = await getIssue(manager, cloudId, issueKey, onStaleCache, estimates)

          if (issueRes instanceof Error || issueRes instanceof RateLimitError) {
            logError(issueRes, {
              userId,
              tags: {cloudId, issueKey, teamId}
            })
            return null
          }

          return {
            ...issueRes,
            teamId,
            userId
          }
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : null))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({cloudId, issueKey}) => JiraIssueId.join(cloudId, issueKey)
    }
  )
}

interface CloudNameLookup {
  [cloudId: string]: string
}
export const atlassianCloudNameLookup = (
  parent: RootDataLoader
): DataLoader<TeamUserKey, CloudNameLookup, string> => {
  return new DataLoader<TeamUserKey, CloudNameLookup, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, userId}) => {
          const auth = await parent.get('freshAtlassianAuth').load({teamId, userId})
          if (!auth) return {}
          const {accessToken} = auth
          const manager = new AtlassianServerManager(accessToken)
          const result = await manager.getCloudNameLookup()
          if (result instanceof Error) {
            logError(result, {userId, tags: {teamId}})
            return {}
          }
          return result
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : {}))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, userId}) => `${teamId}:${userId}`
    }
  )
}

interface CloudNameKey extends TeamUserKey {
  cloudId: string
}

export const atlassianCloudName = (
  parent: RootDataLoader
): DataLoader<CloudNameKey, string, string> => {
  return new DataLoader<CloudNameKey, string, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({cloudId, teamId, userId}) => {
          const lookup = await parent.get('atlassianCloudNameLookup').load({teamId, userId})
          return lookup[cloudId] ?? ''
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : ''))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({cloudId}) => cloudId
    }
  )
}

export const jiraDimensionFieldMap = (parent: RootDataLoader) =>
  new DataLoader<
    {teamId: string; cloudId: string; projectKey: string; dimensionName: string; issueType: string},
    JiraDimensionFieldMap[],
    string
  >(
    async (keys) => {
      return Promise.all(
        keys.map(async (params) => {
          const {cloudId, dimensionName, issueType, projectKey, teamId} = params
          return selectJiraDimensionFieldMap()
            .where('teamId', '=', teamId)
            .where('cloudId', '=', cloudId)
            .where('projectKey', '=', projectKey)
            .where('dimensionName', '=', dimensionName)
            .orderBy(({eb}) => eb.case().when('issueType', '=', issueType).then(0).else(1).end())
            .orderBy('updatedAt', 'desc')
            .execute()
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, cloudId, projectKey, issueType, dimensionName}) =>
        `${teamId}:${cloudId}:${projectKey}:${issueType}:${dimensionName}`
    }
  )
