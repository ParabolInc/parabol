import getRedis from '../getRedis'
import AtlassianManager, {RateLimitError} from 'parabol-client/utils/AtlassianManager'
import ms from 'ms'
import jsonEqual from 'parabol-client/utils/jsonEqual'

const ISSUE_TTL_MS = ms('2d')
const DEFAULT_RETRY_AFTER_SEC = 5

export const getIssue = async (
  manager: AtlassianManager,
  cloudId: string,
  issueKey: string,
  onSuccess: any /* cb invoked when we do lazy async request */,
  onError: any /* error invoked when we do lazy async request */,
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
  retries = 1
) => {
  let freshIssue = await manager.getIssue(cloudId, issueKey, extraFieldIds)

  if (
    (retries > 0 && process.env.TEST_JIRA_ISSUE_RATE_LIMITED) ||
    (retries <= 0 && !process.env.TEST_JIRA_RETRY_SUCCESS)
  ) {
    freshIssue = new RateLimitError('error', {retryAfter: 3})
  }

  if (freshIssue instanceof Error) {
    if (freshIssue instanceof RateLimitError && retries > 0) {
      const retryAfter = freshIssue.infoParams.retryAfter ?? DEFAULT_RETRY_AFTER_SEC
      setTimeout(() => {
        lazilyGetIssueAndMaybePush(
          cachedIssue,
          manager,
          cloudId,
          issueKey,
          onSuccess,
          onError,
          extraFieldIds,
          retries - 1
        )
      }, retryAfter * 1000)
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
