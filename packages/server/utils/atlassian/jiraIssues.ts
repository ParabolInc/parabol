import getRedis from '../getRedis'
import AtlassianManager, {
  RateLimitError,
  JiraIssueBean
} from 'parabol-client/utils/AtlassianManager'
import ms from 'ms'
import jsonEqual from 'parabol-client/utils/jsonEqual'

const ISSUE_TTL_MS = ms('2d')
const DEFAULT_RETRY_AFTER_SEC = 5
const MAX_RETRY_AFTER_SEC = 30
const MAX_RETRIES = 4

const applyBackoff = (retries, seconds) => Math.pow(2, retries) * seconds
const addJitter = (seconds) => seconds + (Math.random() * (1.3 - 0.7) + 0.7)

export const getIssue = async (
  manager: AtlassianManager,
  cloudId: string,
  issueKey: string,
  onSuccess: (
    issue: JiraIssueBean<{description: string; summary: string}, {description: string}>
  ) => void /* cb invoked when we do lazy async request */,
  onError: (e: Error) => void /* error invoked when we do lazy async request */,
  extraFieldIds: string[] = []
) => {
  const key = `jira:${cloudId}:${issueKey}:${JSON.stringify(extraFieldIds)}`
  const redis = getRedis()
  let cachedIssue = await redis.get(key)
  cachedIssue = cachedIssue ? JSON.parse(cachedIssue) : cachedIssue

  if (!cachedIssue) {
    const issueRes = await manager.getIssue(cloudId, issueKey, extraFieldIds)
    if (issueRes instanceof Error) {
      return issueRes
    }
    await redis.set(key, JSON.stringify(issueRes), 'PX', ISSUE_TTL_MS)
    const json = await redis.get(key)
    return JSON.parse(json!)
  } else {
    lazilyGetIssueAndMaybePush(
      cachedIssue,
      manager,
      cloudId,
      issueKey,
      onSuccess,
      onError,
      extraFieldIds
    )
    return cachedIssue
  }
}

/*
 * get issue from jira async, compare and if different,
 * bust the cache and push via subscription
 * this doesn't return anything, only does side effect
 */
const lazilyGetIssueAndMaybePush = async (
  cachedIssue: any,
  manager: AtlassianManager,
  cloudId: string,
  issueKey: string,
  onSuccess: any,
  onError: any,
  extraFieldIds: string[] = [],
  retryCount = 0
) => {
  let freshIssue = await manager.getIssue(cloudId, issueKey, extraFieldIds)

  if (
    (retryCount === 0 && process.env.TEST_JIRA_ISSUE_RATE_LIMITED) ||
    (retryCount > 0 && !process.env.TEST_JIRA_RETRY_SUCCESS)
  ) {
    freshIssue = new RateLimitError('error', {retryAfterSeconds: 3})
  }

  if (freshIssue instanceof Error) {
    if (freshIssue instanceof RateLimitError && retryCount < MAX_RETRIES) {
      let retryAfterSeconds = freshIssue.infoParams.retryAfterSeconds ?? DEFAULT_RETRY_AFTER_SEC
      retryAfterSeconds = applyBackoff(retryCount, retryAfterSeconds)
      retryAfterSeconds = addJitter(retryAfterSeconds)
      retryAfterSeconds = Math.min(retryAfterSeconds, MAX_RETRY_AFTER_SEC)
      setTimeout(() => {
        lazilyGetIssueAndMaybePush(
          cachedIssue,
          manager,
          cloudId,
          issueKey,
          onSuccess,
          onError,
          extraFieldIds,
          retryCount + 1
        )
      }, retryAfterSeconds * 1000)
    } else {
      onError(freshIssue)
    }
  } else {
    if (process.env.TEST_JIRA_FRESH_ISSUE_UPDATES_CACHE) {
      freshIssue.fields.summary = 'issue was edited and lazily fetched'
    }
    const issuesAreEqual = jsonEqual(cachedIssue, freshIssue)
    if (!issuesAreEqual) {
      const redis = getRedis()
      const key = `jira:${cloudId}:${issueKey}:${JSON.stringify(extraFieldIds)}`
      await redis.set(key, JSON.stringify(freshIssue), 'PX', ISSUE_TTL_MS)
      await onSuccess(freshIssue)
    }
  }
}
