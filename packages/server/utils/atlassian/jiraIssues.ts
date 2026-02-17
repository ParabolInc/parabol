import stringify from 'fast-json-stable-stringify'
import ms from 'ms'
import JiraIssueId from 'parabol-client/shared/gqlIds/JiraIssueId'
import {RateLimitError} from 'parabol-client/utils/AtlassianManager'
import type {JiraIssueMissingEstimationFieldHintEnum} from '../../graphql/private/resolverTypes'
import getKysely from '../../postgres/getKysely'
import type {TaskEstimate} from '../../postgres/types'
import type AtlassianServerManager from '../AtlassianServerManager'
import type {JiraGetIssueRes} from '../AtlassianServerManager'
import {generateJiraExtraFields} from '../generateJiraExtraFields'
import getRedis from '../getRedis'
import {Logger} from '../Logger'
import {hasDefaultEstimationField, isValidEstimationField} from './jiraFields'
import {downloadAndCacheImages, updateJiraImageUrls} from './jiraImages'

const ISSUE_TTL_MS = ms('1d')
const MAX_ATTEMPT_DURATION = ms('9s')

export type JiraIssueField = {
  fieldId: string
  fieldName: string
  fieldType: 'string' | 'number'
}

type ManagerGetIssueRes = Awaited<ReturnType<AtlassianServerManager['getIssue']>>
type ValidManagerIssue = Exclude<ManagerGetIssueRes, Error | RateLimitError>

// We define the output shape explicitly, extending the raw fields but acknowledging they are dynamic
export type TransformedJiraIssue = {
  // Core fields from Jira
  summary: string
  description: string
  created: string
  issuetype: {id: string; iconUrl: string}
  // Dynamic fields
  [key: string]: any
  // Computed/Parabol fields
  issueType: string
  possibleEstimationFields: JiraIssueField[]
  missingEstimationFieldHint?: JiraIssueMissingEstimationFieldHintEnum
  descriptionHTML: string
  extraFields: ReturnType<typeof generateJiraExtraFields>
  cloudId: string
  issueKey: string
  id: string
  lastUpdated: string
}

const syncEstimates = async (issueRes: ValidManagerIssue, estimates: TaskEstimate[]) => {
  const {fields} = issueRes
  await Promise.all(
    estimates.map(async (estimate) => {
      const {jiraFieldId, label, discussionId, name, taskId, userId} = estimate
      if (!jiraFieldId) {
        return undefined
      }

      // Dynamic access to fields
      const freshEstimateRaw = (fields as any)[jiraFieldId]
      const freshEstimate = String(freshEstimateRaw ?? '').slice(0, 100)

      if (freshEstimate === label) return undefined

      // mutate the estimate object in memory so the caller sees the update
      estimate.label = freshEstimate

      return getKysely()
        .insertInto('TaskEstimate')
        .values({
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
        .execute()
    })
  ).catch(Logger.error)
}

export const transformJiraIssue = async (
  manager: AtlassianServerManager,
  issueRes: ValidManagerIssue,
  cloudId: string,
  estimates: TaskEstimate[] = []
): Promise<TransformedJiraIssue> => {
  const {fields, renderedFields, changelog} = issueRes

  // 1. Sync estimates first, no need to await
  syncEstimates(issueRes, estimates).catch(() => {})

  // 2. Handle images
  // descriptionHTML comes from renderedFields in the raw response
  const rawDescriptionHTML = renderedFields.description
  const {updatedDescription, imageUrlToHash} = updateJiraImageUrls(cloudId, rawDescriptionHTML)
  await downloadAndCacheImages(manager, imageUrlToHash)

  // 3. Extract estimation fields
  const possibleEstimationFields = [] as JiraIssueField[]
  const editMetaFields = issueRes.editmeta?.fields

  if (editMetaFields) {
    Object.entries<{schema: {type: string}}>(editMetaFields).forEach(([fieldId, {schema}]) => {
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
    })
  }

  possibleEstimationFields.sort((a, b) => a.fieldName.localeCompare(b.fieldName))

  // Cast fields to any to access dynamic properties like 'project'
  const fieldsAny = fields as any
  const simplified = !!fieldsAny.project?.simplified
  const missingEstimationFieldHint: JiraIssueMissingEstimationFieldHintEnum | undefined =
    hasDefaultEstimationField(possibleEstimationFields.map(({fieldName}) => fieldName))
      ? undefined
      : simplified
        ? 'teamManagedStoryPoints'
        : 'companyManagedStoryPoints'

  const lastUpdated = changelog?.histories?.[0]?.created ?? fields.created

  return {
    ...fields,
    issueType: fields.issuetype.id,
    possibleEstimationFields,
    missingEstimationFieldHint,
    descriptionHTML: updatedDescription,
    extraFields: generateJiraExtraFields(issueRes as unknown as JiraGetIssueRes),
    cloudId,
    issueKey: issueRes.key,
    id: JiraIssueId.join(cloudId, issueRes.key),
    lastUpdated
  }
}

export const storeAndNetwork = async <T>(
  redisKey: string,
  fetchAndTransform: () => Promise<T | Error | RateLimitError>,
  ttlMs: number,
  onStaleCache?: (fresh: T) => void
): Promise<T | Error | RateLimitError> => {
  const redis = getRedis()
  const cached = await redis.get(redisKey).catch(() => null)

  if (cached) {
    const parsed = JSON.parse(cached) as T
    // fire-and-forget network behind the cache
    fetchAndTransform()
      .then((res) => {
        if (res instanceof Error || res instanceof RateLimitError) return
        const freshStr = stringify(res)
        if (freshStr !== cached) {
          redis.set(redisKey, freshStr, 'PX', ttlMs)
          onStaleCache?.(res)
        }
      })
      .catch(Logger.error)
    return parsed
  }

  // Cache miss — await network
  const result = await fetchAndTransform()
  if (!(result instanceof Error) && !(result instanceof RateLimitError)) {
    redis.set(redisKey, stringify(result), 'PX', ttlMs)
  }
  return result
}

// Re-export for compatibility or simpler usage
export const getIssue = async (
  manager: AtlassianServerManager,
  cloudId: string,
  issueKey: string,
  onStaleCache: (issue: TransformedJiraIssue) => void /* callback for fresh data */,
  estimates: TaskEstimate[] = []
) => {
  const redisKey = `jira:${cloudId}:${issueKey}`
  const tryUntil = new Date(Date.now() + MAX_ATTEMPT_DURATION)

  return storeAndNetwork(
    redisKey,
    async () => {
      const raw = await manager.fetchWithRetry(
        () => manager.getIssue(cloudId, issueKey, ['*all'], ['names', 'schema']),
        tryUntil
      )
      if (raw instanceof RateLimitError || raw instanceof Error) return raw
      return transformJiraIssue(manager, raw, cloudId, estimates)
    },
    ISSUE_TTL_MS,
    onStaleCache
  )
}
