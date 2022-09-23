import DataLoader from 'dataloader'
import {decode} from 'jsonwebtoken'
import JiraIssueId from 'parabol-client/shared/gqlIds/JiraIssueId'
import JiraProjectId from 'parabol-client/shared/gqlIds/JiraProjectId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {
  JiraGetIssueRes,
  JiraGQLFields,
  JiraProject,
  RateLimitError
} from 'parabol-client/utils/AtlassianManager'
import JiraIssue from '../graphql/types/JiraIssue'
import {AtlassianAuth} from '../postgres/queries/getAtlassianAuthByUserIdTeamId'
import getAtlassianAuthsByUserId from '../postgres/queries/getAtlassianAuthsByUserId'
import insertTaskEstimate from '../postgres/queries/insertTaskEstimate'
import upsertAtlassianAuths from '../postgres/queries/upsertAtlassianAuths'
import getJiraDimensionFieldMap, {
  GetJiraDimensionFieldMapParams,
  JiraDimensionFieldMap
} from '../postgres/queries/getJiraDimensionFieldMap'
import {isValidEstimationField} from '../utils/atlassian/jiraFields'
import {downloadAndCacheImages, updateJiraImageUrls} from '../utils/atlassian/jiraImages'
import {getIssue} from '../utils/atlassian/jiraIssues'
import AtlassianServerManager from '../utils/AtlassianServerManager'
import publish from '../utils/publish'
import sendToSentry from '../utils/sendToSentry'
import RootDataLoader from './RootDataLoader'

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
      const results = await Promise.allSettled(
        keys.map(async ({userId, teamId}) => {
          const userAtlassianAuths = await getAtlassianAuthsByUserId(userId)
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
              sendToSentry(oauthRes)
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

interface JiraGQLProject extends JiraProject {
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
            sendToSentry(projectRes, {userId, tags: {teamId, projectKey}})
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

export type JiraIssue = JiraGetIssueRes['fields'] & {
    issueType: string,
    possibleEstimationFieldNames: string[],
    descriptionHTML: string,
    teamId: string,
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

          const cacheImagesUpdateEstimates = async (issueRes: JiraGetIssueRes) => {
            const {fields} = issueRes
            const {updatedDescription, imageUrlToHash} = updateJiraImageUrls(
              cloudId,
              issueRes.fields.descriptionHTML
            )
            downloadAndCacheImages(manager, imageUrlToHash)
            // update our records
            await Promise.all(
              estimates.map((estimate) => {
                const {jiraFieldId, label, discussionId, name, taskId, userId} = estimate
                if (!jiraFieldId) {
                  return undefined
                }
                const freshEstimate = String(fields[jiraFieldId as keyof JiraGQLFields])
                if (freshEstimate === label) return undefined
                // mutate current dataloader
                estimate.label = freshEstimate
                return insertTaskEstimate({
                  changeSource: 'external',
                  // keep the link to the discussion alive, if possible
                  discussionId,
                  jiraFieldId,
                  label: freshEstimate,
                  name,
                  meetingId: null,
                  stageId: null,
                  taskId,
                  userId
                })
              })
            )

            const simplified = !!issueRes.fields.project?.simplified

            const possibleEstimationFieldNames = [] as string[]
            Object.entries<any>(issueRes.editmeta?.fields)?.forEach(([fieldId, {schema}]) => {
              if (
                isValidEstimationField(schema.type, issueRes.names[fieldId], fieldId, simplified)
              ) {
                possibleEstimationFieldNames.push(issueRes.names[fieldId])
              }
              if (schema.type === 'timetracking') {
                possibleEstimationFieldNames.push(issueRes.names['timeestimate'])
                possibleEstimationFieldNames.push(issueRes.names['timeoriginalestimate'])
              }
            })
            possibleEstimationFieldNames.sort()

            return {
              ...fields,
              issueType: fields.issuetype.id,
              possibleEstimationFieldNames,
              descriptionHTML: updatedDescription,
              teamId,
              userId
            }
          }

          const publishUpdatedIssue = async (issue: JiraGetIssueRes) => {
            const res = await cacheImagesUpdateEstimates(issue)
            publish(SubscriptionChannel.NOTIFICATION, viewerId, JiraIssue, res)
          }
          const issueRes = await getIssue(
            manager,
            cloudId,
            issueKey,
            publishUpdatedIssue,
            ['*all'],
            ['names', 'schema']
          )
          if (issueRes instanceof Error || issueRes instanceof RateLimitError) {
            sendToSentry(issueRes, {userId, tags: {cloudId, issueKey, teamId}})
            return null
          }
          const res = await cacheImagesUpdateEstimates(issueRes)
          return res
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
            sendToSentry(result, {userId, tags: {teamId}})
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
  new DataLoader<GetJiraDimensionFieldMapParams, JiraDimensionFieldMap | null, string>(
    async (keys) => {
      return Promise.all(
        keys.map(async (params) => {
          return getJiraDimensionFieldMap(params)
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, cloudId, projectKey, issueType, dimensionName}) =>
        `${teamId}:${cloudId}:${projectKey}:${issueType}:${dimensionName}`
    }
  )
