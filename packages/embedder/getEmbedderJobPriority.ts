import {getNewDataLoader} from '../server/dataloader/getNewDataLoader'
import type {DataLoaderWorker} from '../server/graphql/graphql'
import type {Tierenum} from '../server/postgres/types/pg'
import getRedis, {type RedisPipelineResponse} from '../server/utils/getRedis'

const BASE_EPOCH = Math.floor(new Date('2026-01-01').getTime() / 1000)
export const FAILED_JOB_PENALTY = 50_000

const jobKindWeights = {
  userQuery: 1, // requires instant feedback, e.g. search
  relatedDiscussion: 2, // needs feedback while they are still on the same topic
  corpusUpdate: 3, // needs update before they search the document
  historicalUpdate: 4, // needs update eventually (e.g. new jobType)
  modelUpdate: 5 // populating a new model
} as const

export type JobKind = keyof typeof jobKindWeights

const userTierWeights: Record<Tierenum, number> = {
  enterprise: 1,
  team: 2,
  starter: 3
}

const getThrottlePenalty = async (userId: string | undefined | null) => {
  if (!userId) return 0
  const key = `embedThrottle:${userId}`
  const now = Math.floor(Date.now() / 1000)

  const bucketSize = 60 // 1-minute buckets
  const windowSize = 3600 // 1-hour window

  const currentBucket = (Math.floor(now / bucketSize) * bucketSize).toString()
  const redis = getRedis()

  // 1. Atomic Write & Read
  const results = (await redis
    .multi()
    .hincrby(key, currentBucket, 1)
    .hexpire(key, windowSize, 'FIELDS', 1, currentBucket)
    .hgetall(key)
    .expire(key, windowSize + bucketSize)
    .exec()) as [
    RedisPipelineResponse<number>,
    RedisPipelineResponse<number[]>,
    RedisPipelineResponse<Record<string, string>>,
    RedisPipelineResponse<number>
  ]

  const allBuckets = results?.[2]?.[1] || {}
  let totalCount = 0
  for (const countStr of Object.values(allBuckets)) {
    totalCount += parseInt(countStr, 10)
  }

  // no penalty for < 10 queries in the last hour. Exponential penalty after that
  const PENALTY = 500
  const QUERY_SOFT_LIMIT = 10
  return totalCount < QUERY_SOFT_LIMIT ? 0 : Math.pow(totalCount, 2) * PENALTY
}

const getUserPenalties = async (
  userId: string | undefined | null,
  jobKind: JobKind,
  dataLoader?: DataLoaderWorker | null
) => {
  if (!userId) return 0
  if (jobKind === 'userQuery') {
    // No user tier penalty for searches. All users should get a quick search
    return getThrottlePenalty(userId)
  }
  const penaltyDataLoader = dataLoader || getNewDataLoader('getUserPenalties')
  const [tier, throttlePenalty] = await Promise.all([
    penaltyDataLoader.get('highestTierForUserId').load(userId),
    getThrottlePenalty(userId)
  ])
  if (!dataLoader) {
    penaltyDataLoader.dispose()
  }
  return 100_000 * userTierWeights[tier] + throttlePenalty
}

export const getEmbedderJobPriority = async (
  jobKind: JobKind,
  userId: string | undefined | null,
  retryCount: number,
  dataLoader?: DataLoaderWorker | null
) => {
  const timestampPenalty = Math.floor(Date.now() / 1000) - BASE_EPOCH
  const jobTypePenalty = 100_000_000 * jobKindWeights[jobKind]
  const userPenalties = await getUserPenalties(userId, jobKind, dataLoader)
  const failedJobPenalty = FAILED_JOB_PENALTY * retryCount
  const score = jobTypePenalty + userPenalties + timestampPenalty + failedJobPenalty
  return Math.max(-2147483648, Math.min(2147483647, Math.floor(score)))
}
