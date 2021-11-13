import getRedis from '../getRedis'
import AtlassianManager, {RateLimitError, JiraIssueRaw} from 'parabol-client/utils/AtlassianManager'
import ms from 'ms'
import sleep from 'parabol-client/utils/sleep'
import stringify from 'fast-json-stable-stringify'

const ISSUE_TTL_MS = ms('2d')
const MAX_RETRIES = 4

type StoreAndNetworkRequests = RequestsInit | CacheHit | CacheMiss | CacheError

interface RequestsInit {
  firstToResolve: undefined | ((value: unknown) => void)
  cachedIssue: undefined
}
interface CacheHit {
  firstToResolve: (value: unknown) => void
  cachedIssue: string
}
interface CacheMiss {
  firstToResolve: (value: unknown) => void
  cachedIssue: null
}
type CacheError = RequestsInit

/* helper fn to only do jira request side effects and return nothing */
const _getIssueFromJira = async (
  manager: AtlassianManager,
  cloudId: string,
  issueKey: string,
  pushUpdateToClient: (
    issue: JiraIssueRaw
  ) => void /* cb invoked when we get a fresher jira issue */,
  extraFieldIds: string[],
  redisKey: string,
  requests: StoreAndNetworkRequests, // resolve originally created promise in outer fn
  retryNo = 0
) => {
  // get issue from external network (jira api)
  manager.getIssue(cloudId, issueKey, extraFieldIds).then(async (res) => {
    if (res instanceof RateLimitError) {
      const {retryAt} = res
      const delay = Math.max(0, retryAt.getTime() - Date.now())
      if (delay > ms('10s') || retryNo > MAX_RETRIES) return
      await sleep(delay)
      _getIssueFromJira(
        manager,
        cloudId,
        issueKey,
        pushUpdateToClient,
        extraFieldIds,
        redisKey,
        requests,
        retryNo + 1
      )
      return
    } else if (res instanceof Error) {
      /*
       * does nothing if redis already returned a res, else resolve with error
       * don't wait for redis if it's unresponsive and still hasn't returned
       */
      requests.firstToResolve!(res)
      return
    }

    const redis = getRedis()
    // got a successful response from jira
    if (!requests.cachedIssue) {
      // redis is unresponsive or returned null
      requests.firstToResolve!(res)
      redis.set(redisKey, stringify(res), 'PX', ISSUE_TTL_MS) // set cache behind
    } else {
      // there was a cached value in redis, firstToResolve already called
      const issueFromJiraStr = stringify(res)
      if (issueFromJiraStr !== requests.cachedIssue) {
        // update redis & push an update via pubsub
        pushUpdateToClient(res)
        redis.set(redisKey, issueFromJiraStr, 'PX', ISSUE_TTL_MS) // set cache behind
      }
      // if they're equal, do nothing
    }
  })
}

export const getIssue = async (
  manager: AtlassianManager,
  cloudId: string,
  issueKey: string,
  pushUpdateToClient: (
    issue: JiraIssueRaw
  ) => void /* cb invoked when we get a fresher issue from jira */,
  extraFieldIds: string[] = []
) => {
  const requests = {
    firstToResolve: undefined,
    cachedIssue: undefined
  } as StoreAndNetworkRequests
  const returnValuePromise = new Promise((resolve) => {
    // return this promise immediately, save resolve so we can call it later
    requests.firstToResolve = resolve
  })
  const redisKey = `jira:${cloudId}:${issueKey}:${JSON.stringify(extraFieldIds)}`
  const redis = getRedis()
  // get issue from redis
  redis.get(redisKey).then((res) => {
    requests.cachedIssue = res
    if (res) {
      requests.firstToResolve!(JSON.parse(res))
    }
  })
  _getIssueFromJira(
    manager,
    cloudId,
    issueKey,
    pushUpdateToClient,
    extraFieldIds,
    redisKey,
    requests // pass requests obj so jira retries resolve the originally returned promise
  )
  return returnValuePromise
}
