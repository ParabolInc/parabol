/*
  This is a stateless function that can be broken out into its own microservice to scale
  It is used for all GraphQL queries, both trusted and untrusted
  It is NOT used for subscription source streams, since those require state
  It IS used to transform a source stream into a response stream
 */
import {ExecutionResult, graphql} from 'graphql'
import {ExecutionResultDataDefault} from 'graphql/execution/execute'
import getRethink from '../database/rethinkDriver'
import AuthToken from '../database/types/AuthToken'
import PROD from '../PROD'
import CompiledQueryCache from './CompiledQueryCache'
import getDataLoader from './getDataLoader'
import getRateLimiter from './getRateLimiter'
import privateSchema from './intranetSchema/intranetSchema'
import publicSchema from './rootSchema'

export interface GQLRequest {
  jobId: string
  authToken: AuthToken
  ip?: string
  socketId?: string
  variables?: {[key: string]: any}
  docId?: string
  query?: string
  rootValue?: {[key: string]: any}
  dataLoaderId?: string
  // true if the query is on the private schema
  isPrivate?: boolean
  // true if the query is ad-hoc (e.g. GraphiQL, CLI)
  isAdHoc?: boolean
}

const queryCache = new CompiledQueryCache()
interface LongQuery {
  duration: number
  userId: string
  ip: string
  docId: string
  variables: string
}

const REQUESTS = [] as LongQuery[]
const MIN_DURATION = Number(process.env.MIN_LOG_DURATION)
const LOG_BATCH_SIZE = 50
const flushLogToDB = async () => {
  if (REQUESTS.length === 0) return
  const r = await getRethink()
  r.table('GQLRequest')
    .insert(REQUESTS)
    .run()
  REQUESTS.length = 0
}

// setInterval(flushLogToDB, ms('10m'))

const executeGraphQL = async <T = ExecutionResultDataDefault>(req: GQLRequest) => {
  const {
    ip,
    authToken,
    socketId,
    variables,
    docId,
    query,
    isPrivate,
    isAdHoc,
    dataLoaderId,
    rootValue
  } = req
  // never re-use a dataloader since the things it cached may be old
  const dataLoader = getDataLoader(dataLoaderId)
  dataLoader.share()
  const rateLimiter = getRateLimiter()
  const contextValue = {ip, authToken, socketId, rateLimiter, dataLoader}
  const schema = isPrivate ? privateSchema : publicSchema
  const variableValues = variables
  const source = query!
  let response: ExecutionResult<T>
  const start = Date.now()
  if (isAdHoc) {
    response = await graphql({schema, source, variableValues, contextValue})
  } else {
    const compiledQuery = docId
      ? await queryCache.fromID(docId, schema)
      : queryCache.fromString(source, schema)
    if (compiledQuery) {
      response = ((await compiledQuery.query(
        rootValue,
        contextValue,
        variableValues
      )) as any) as ExecutionResultDataDefault
    } else {
      response = {errors: [new Error(`DocumentID not found: ${docId}`)] as any}
    }
  }
  if (!PROD && response.errors) {
    console.trace({error: response.errors})
  }
  const end = Date.now()
  const duration = end - start
  if (duration > MIN_DURATION) {
    try {
      const length = REQUESTS.push({
        duration,
        ip: ip ?? '',
        userId: authToken?.sub ?? '',
        docId: docId ?? '',
        variables: JSON.stringify(variables)
      })

      if (length > LOG_BATCH_SIZE) {
        flushLogToDB()
      }
    } catch (e) {
      console.log('Error flushing', e)
    }
  }
  dataLoader.dispose()
  return response
}

export default executeGraphQL
