import DataLoader from 'dataloader'
import {decode} from 'jsonwebtoken'
import JiraIssueId from 'parabol-client/shared/gqlIds/JiraIssueId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import type {JiraIssueMissingEstimationFieldHintEnum} from '../graphql/private/resolverTypes'
import {fetchJiraProjectsResult} from '../integrations/jira/fetchJiraProjects'
import refreshAtlassianAuth from '../integrations/jira/refreshAtlassianAuth'
import {legacyPushProvenance} from '../integrations/platform/legacyPushProvenance'
import getKysely from '../postgres/getKysely'
import {selectAtlassianAuth} from '../postgres/select'
import type {AtlassianAuth} from '../postgres/types'
import AtlassianServerManager, {
  type JiraIssueRaw,
  type JiraProject
} from '../utils/AtlassianServerManager'
import {hasDefaultEstimationField, isValidEstimationField} from '../utils/atlassian/jiraFields'
import {processJiraImages} from '../utils/atlassian/jiraImages'
import {generateJiraExtraFields} from '../utils/generateJiraExtraFields'
import logError from '../utils/logError'
import publish from '../utils/publish'
import {redisStoreAndNetwork} from '../utils/redisStoreAndNetwork'
import type RootDataLoader from './RootDataLoader'
import settleOrLogRejection from './settleOrLogRejection'

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

const isAccessTokenFresh = (accessToken: string, inAMinute: number) => {
  const decoded = decode(accessToken)
  const exp = decoded && typeof decoded === 'object' ? decoded.exp : undefined
  return typeof exp === 'number' && exp * 1000 > inAMinute
}

/** The stored Atlassian row, never refreshed — safe for any surface that only reports on the connection */
export const atlassianAuth = (
  parent: RootDataLoader
): DataLoader<TeamUserKey, AtlassianAuth | null, string> => {
  return new DataLoader<TeamUserKey, AtlassianAuth | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({userId, teamId}) => {
          const auth = await selectAtlassianAuth()
            .where('userId', '=', userId)
            .where('teamId', '=', teamId)
            .where('isActive', '=', true)
            .executeTakeFirst()
          return auth ?? null
        })
      )
      return settleOrLogRejection(results, keys)
    },
    {...parent.dataLoaderOptions, cacheKeyFn: (key) => `${key.userId}:${key.teamId}`}
  )
}

export const freshAtlassianAuth = (
  parent: RootDataLoader
): DataLoader<TeamUserKey, AtlassianAuth | null, string> => {
  return new DataLoader<TeamUserKey, AtlassianAuth | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({userId, teamId}) => {
          const auth = await parent.get('atlassianAuth').load({userId, teamId})
          if (!auth) return null
          const inAMinute = Date.now() + 60_000
          const isFresh = auth.expiresAt
            ? auth.expiresAt.getTime() > inAMinute
            : isAccessTokenFresh(auth.accessToken, inAMinute)
          if (isFresh) return auth
          const provider = await parent.get('integrationProviders').loadNonNull(auth.providerId)
          if (provider.service !== 'jira') {
            logError(new Error(`Auth ${auth.id} points at a ${provider.service} provider`), {
              userId,
              tags: {teamId}
            })
            return null
          }
          const refreshed = await refreshAtlassianAuth(auth, provider)
          parent.get('teamMemberIntegrationAuthsByServiceTeamAndUserId').clearAll()
          parent.get('atlassianAuth').clearAll()
          return refreshed
        })
      )
      return settleOrLogRejection(results, keys)
    },
    {...parent.dataLoaderOptions, cacheKeyFn: (key) => `${key.userId}:${key.teamId}`}
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
          const {projects, error} = await fetchJiraProjectsResult({
            dataLoader: parent,
            teamId,
            userId
          })
          if (error) logError(error, {userId, tags: {teamId, service: 'jira'}})
          return projects
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

type JiraIssueField = {
  fieldId: string
  fieldName: string
  fieldType: 'string' | 'number'
}
export type JiraIssue = {
  cloudId: string
  issueKey: string
  id: string
  description: any
  descriptionHTML: string
  summary: string
  issuetype: {id: string; iconUrl: string}
  created: string
  lastUpdated: string
  project?: {simplified: boolean}
  extraFields: ReturnType<typeof generateJiraExtraFields>
  issueType: string
  possibleEstimationFields: JiraIssueField[]
  missingEstimationFieldHint?: JiraIssueMissingEstimationFieldHintEnum
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

          const cacheImagesUpdateEstimates = async (issueRes: JiraIssueRaw) => {
            const {fields} = issueRes
            const updatedDescription = await processJiraImages(
              manager,
              cloudId,
              teamId,
              issueRes.renderedFields.description ?? ''
            )
            // update our records
            await Promise.all(
              estimates.map((estimate) => {
                const {label, discussionId, name, taskId, userId, pushResult} = estimate
                const jiraFieldId =
                  pushResult?.service === 'jira'
                    ? (pushResult.fieldId as keyof typeof fields)
                    : null
                if (!jiraFieldId) {
                  return undefined
                }
                const freshEstimate = String(fields[jiraFieldId]).slice(0, 100)
                if (freshEstimate === label) return undefined
                // mutate current dataloader
                estimate.label = freshEstimate
                return getKysely()
                  .insertInto('TaskEstimate')
                  .values({
                    changeSource: 'external',
                    // keep the link to the discussion alive, if possible
                    discussionId,
                    pushResult,
                    ...legacyPushProvenance(pushResult),
                    label: freshEstimate,
                    name,
                    meetingId: null,
                    stageId: null,
                    taskId,
                    userId
                  })
                  .execute()
              })
            )

            const possibleEstimationFields = [] as JiraIssueField[]
            Object.entries<{schema: {type: string}}>(issueRes.editmeta?.fields)?.forEach(
              ([fieldId, {schema}]) => {
                const fieldName = issueRes.names[fieldId] ?? fieldId
                if (isValidEstimationField(schema.type, fieldName, fieldId)) {
                  possibleEstimationFields.push({
                    fieldId,
                    fieldName,
                    fieldType: schema.type as 'string' | 'number'
                  })
                }
                if (schema.type === 'timetracking') {
                  const timeEstimate = issueRes.names['timeestimate']
                  if (timeEstimate) {
                    possibleEstimationFields.push({
                      fieldId: 'timeestimate',
                      fieldName: timeEstimate,
                      fieldType: 'string'
                    })
                  }
                  const timeOriginalEstimate = issueRes.names['timeoriginalestimate']
                  if (timeOriginalEstimate) {
                    possibleEstimationFields.push({
                      fieldId: 'timeoriginalestimate',
                      fieldName: timeOriginalEstimate,
                      fieldType: 'string'
                    })
                  }
                }
              }
            )
            possibleEstimationFields.sort((a, b) => a.fieldName.localeCompare(b.fieldName))

            const simplified = !!issueRes.fields.project?.simplified
            const missingEstimationFieldHint: JiraIssueMissingEstimationFieldHintEnum | undefined =
              hasDefaultEstimationField(possibleEstimationFields.map(({fieldName}) => fieldName))
                ? undefined
                : simplified
                  ? 'teamManagedStoryPoints'
                  : 'companyManagedStoryPoints'

            return {
              ...fields,
              cloudId,
              issueKey,
              id: JiraIssueId.join(cloudId, issueKey),
              lastUpdated: issueRes.changelog.histories[0]?.created ?? fields.created,
              extraFields: generateJiraExtraFields(issueRes),
              issueType: fields.issuetype.id,
              possibleEstimationFields,
              missingEstimationFieldHint,
              descriptionHTML: updatedDescription,
              teamId,
              userId
            }
          }

          const redisKey = `jira:${cloudId}:${issueKey}:["*all"]["names","schema"]`
          const issueRes = await redisStoreAndNetwork(
            redisKey,
            () => manager.getIssue(cloudId, issueKey, ['*all'], ['names', 'schema']),
            cacheImagesUpdateEstimates,
            {
              onUpdate: (res) => {
                publish(SubscriptionChannel.NOTIFICATION, viewerId, 'JiraIssue', res)
              }
            }
          )
          if (issueRes instanceof Error) {
            logError(issueRes, {userId, tags: {cloudId, issueKey, teamId}})
            return null
          }
          return issueRes
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
