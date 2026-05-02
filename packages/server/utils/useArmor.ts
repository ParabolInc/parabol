import {costLimitRule} from '@escape.tech/graphql-armor-cost-limit'
import {maxAliasesRule} from '@escape.tech/graphql-armor-max-aliases'
import {maxDepthRule} from '@escape.tech/graphql-armor-max-depth'
import {maxDirectivesRule} from '@escape.tech/graphql-armor-max-directives'
import {MaxTokensParserWLexer} from '@escape.tech/graphql-armor-max-tokens'
import {GraphQLError, print, Source} from 'graphql'
import {ParseOptions} from 'graphql/language/parser'
import type {Plugin} from 'graphql-yoga'
import type {DataLoaderWorker} from '../graphql/graphql'
import type {Tierenum} from '../postgres/types/pg'
import type {ServerContext} from '../yoga'
import {getUserId} from './authorization'
import {BoundedCache} from './BoundedCache'
import getRedis, {type RedisPipelineResponse} from './getRedis'

const queryCostCache = new BoundedCache<string, number>(100)

const burstLimits = {
  enterprise: 500_000,
  team: 50_000,
  starter: 500
} satisfies Record<Tierenum, number>

const sessionLimits = {
  enterprise: 5_000_000,
  team: 500_000,
  starter: 5_000
} satisfies Record<Tierenum, number>
function parseWithTokenLimit(source: string | Source, options?: ParseOptions) {
  const parser = new MaxTokensParserWLexer(source, {...options, n: 1000})
  return parser.parseDocument()
}

const checkUsage = async (userId: string, cost: number) => {
  const key = `adhocGQL:${userId}`
  const now = Math.floor(Date.now() / 1000)

  const bucketSize = 60 // 1-minute buckets
  const windowSize = 3600 // 1-hour window

  const currentBucketTs = Math.floor(now / bucketSize) * bucketSize
  const currentBucket = currentBucketTs.toString()
  const redis = getRedis()
  const roundedCost = Math.round(cost)
  // 1. Atomic Write & Read
  const results = (await redis
    .multi()
    .hincrby(key, currentBucket, roundedCost)
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
  let totalCost = 0
  for (const countStr of Object.values(allBuckets)) {
    totalCost += parseInt(countStr, 10)
  }

  const burstReset = currentBucketTs + bucketSize
  const bucketKeys = Object.keys(allBuckets).map(Number)
  const oldestBucketTs = bucketKeys.length > 0 ? Math.min(...bucketKeys) : currentBucketTs
  const sessionReset = oldestBucketTs + windowSize

  return {
    lastHour: totalCost,
    lastMinute: parseInt(allBuckets[currentBucket]!, 10),
    burstReset,
    sessionReset
  }
}

export const useArmor = (): Plugin<ServerContext & {dataLoader: DataLoaderWorker}> => {
  return {
    async onParams({request, context}) {
      const body = await request.json()
      // set the docId so we know which are persisted (i.e. trusted)
      ;(context as ServerContext).docId = body.docId
    },
    onParse({setParseFn, context}) {
      const {authToken, docId} = context
      const isSuperUser = authToken?.rol === 'su'
      if (!docId && !isSuperUser) {
        setParseFn(parseWithTokenLimit)
      }
    },
    onValidate({addValidationRule, context, params, extendContext}) {
      const {authToken, docId} = context
      const isSuperUser = authToken?.rol === 'su'
      if (!docId && !isSuperUser) {
        addValidationRule(
          costLimitRule({
            onAccept: [
              (_ctx, {n: apiCost}) => {
                const queryStr = print(params.documentAST)
                queryCostCache.set(queryStr, apiCost)
                // extend context so we don't have to print the AST twice
                extendContext({apiCost})
              }
            ]
          })
        )
        addValidationRule(maxAliasesRule())
        addValidationRule(maxDepthRule())
        addValidationRule(maxDirectivesRule())
      }
    },
    async onExecute({args, context}) {
      const {apiCost: contextCost, dataLoader, authToken, docId} = context
      const authTokenRole = authToken?.rol
      const isSuperUser = authTokenRole === 'su'
      if (docId || isSuperUser) return
      const apiCost = contextCost || queryCostCache.get(print(args.document))
      if (!apiCost) throw new GraphQLError('API Cost for adhoc query not determined')
      const viewerId = getUserId(authToken)
      if (!viewerId) throw new GraphQLError('No auth token for PAT')
      const [tier, usage] = await Promise.all([
        dataLoader.get('highestTierForUserId').load(viewerId),
        checkUsage(viewerId, apiCost)
      ])
      const burstQuota = burstLimits[tier]
      const sessionQuota = sessionLimits[tier]
      const {lastHour, lastMinute, burstReset, sessionReset} = usage
      const isBurstExceeded = lastMinute > burstQuota
      const isSessionExceeded = lastHour > sessionQuota
      if (isBurstExceeded || isSessionExceeded) {
        const [limit, remaining, reset] = isBurstExceeded
          ? [burstQuota, 0, burstReset]
          : [sessionQuota, 0, sessionReset]
        const now = Math.floor(Date.now() / 1000)
        throw new GraphQLError('429 Too Many Requests', {
          extensions: {
            http: {
              status: 429,
              headers: {
                'X-RateLimit-Limit': String(limit),
                'X-RateLimit-Remaining': String(remaining),
                'X-RateLimit-Reset': String(reset),
                'Retry-After': String(reset - now)
              }
            }
          }
        })
      }
    }
  }
}
