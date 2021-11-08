import getRedis from '../getRedis'
import AtlassianManager, {RateLimitError, JiraIssueRaw} from 'parabol-client/utils/AtlassianManager'
import ms from 'ms'
import sleep from 'parabol-client/utils/sleep'
import stringify from 'fast-json-stable-stringify'

const ISSUE_TTL_MS = ms('2d')

interface CacheHit {
  resolve: undefined // i don't really like this naming. can we name it extNetwork resolve or something?
  cachedIssue: string
}

interface CacheMiss {
  resolve: (value: unknown) => void
  cachedIssue: null
}

interface CacheInit {
  resolve: undefined
  cachedIssue: undefined
}

type ReturnValue = CacheInit | CacheMiss | CacheHit

/*
  what if we return a resolve, and whichever one returns first--
  jira or redis, we call that resolve and return it??
*/

export const getIssue = async (
  manager: AtlassianManager,
  cloudId: string,
  issueKey: string,
  pushUpdateToClient: (issue: JiraIssueRaw) => void /* cb invoked when we do lazy async request */,
  extraFieldIds: string[] = []
) => {
  const key = `jira:${cloudId}:${issueKey}:${JSON.stringify(extraFieldIds)}`
  const redis = getRedis()
  const returnValue = {resolve: undefined, cachedIssue: undefined} as ReturnValue
  const cachedIssuePromise = redis.get(key)
  manager.getIssue(cloudId, issueKey, extraFieldIds).then(async (res) => {
    // await issueResPromise
    if (res instanceof RateLimitError) {
      // todo: test this path
      // do rate limit handling things
      const {retryAt} = res
      const delay = Math.max(0, retryAt.getTime() - Date.now())
      if (delay > ms('10s')) return res
      await sleep(delay)
      // i want to put max retry back in, bc i don't trust jira to send header
      return getIssue(manager, cloudId, issueKey, pushUpdateToClient, extraFieldIds)
    } else if (res instanceof Error) {
      // todo: test this path
      // return an error
      return res
    }

    if (returnValue.cachedIssue === undefined) {
      console.log('return value cached issue is undefined')
      // redis is guaranteed to have returned, this is a noop
      // is it really tho? what happens if redis is unresponsive?
    } else if (returnValue.cachedIssue === null) {
      // tested this path
      console.log('return value cached issue is null')
      // the cache was empty when atlassian returned
      const issueFromJira = stringify(res)
      await redis.set(key, issueFromJira, 'PX', ISSUE_TTL_MS)
      returnValue.resolve(res)
    } else {
      // tested this path
      console.log('theres a cached value in redis')
      // there was a cached value in redis
      res.fields.summary = 'updated fresher'
      const issueFromJira = stringify(res)
      if (issueFromJira !== returnValue.cachedIssue) {
        console.log('got fresher value from jira')
        // the value from jira is fresher than what we have in redis
        // update redis & push an update via pubsub
        redis.set(key, issueFromJira, 'PX', ISSUE_TTL_MS)
        pushUpdateToClient(res)
      }
      // if they're equal, do nothing
    }
  })
  // we can simulate unresponsive redis by doing a long ass sleep
  // returnValue.cachedIssue = await cachedIssuePromise
  returnValue.cachedIssue = (await sleep(60000)) as null
  if (returnValue.cachedIssue) {
    console.log('returning cached issue', returnValue.cachedIssue, typeof returnValue.cachedIssue)
    return JSON.parse(returnValue.cachedIssue)
  }
  return new Promise((resolve) => {
    // resolve only exists if there was no cached value
    returnValue.resolve = resolve
  })
}
