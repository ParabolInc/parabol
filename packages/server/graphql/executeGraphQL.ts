/*
  This is a stateless function that can be broken out into its own microservice to scale
  It is used for all GraphQL queries, both trusted and untrusted
  It is NOT used for subscription source streams, since those require state
  It IS used to transform a source stream into a response stream
 */
import {execute, ExecutionResult, graphql} from 'graphql'
import AuthToken from '../database/types/AuthToken'
import DocumentCache from './DocumentCache'
import getDataLoader from './getDataLoader'
import privateSchema from './intranetSchema/intranetSchema'
import publicSchema from './rootSchema'
import getRateLimiter from './getRateLimiter'
// import {getUserId} from '../utils/authorization'
import {ExecutionResultDataDefault} from 'graphql/execution/execute'

interface GQLRequest {
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

const documentCache = new DocumentCache()

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
  // const viewerId = getUserId(authToken)
  // dataloaders are only reuseable if they are non-mutative
  // since the mutation might change the underlying data but keep the previously used dataloader
  // const reuseableId = docId?.[0] === 'q' ? viewerId : undefined // removing to triage the wonky behavior
  const dataLoader = getDataLoader(dataLoaderId)
  dataLoader.share()
  const rateLimiter = getRateLimiter()
  const contextValue = {ip, authToken, socketId, rateLimiter, dataLoader}
  const schema = isPrivate ? privateSchema : publicSchema
  const variableValues = variables
  const source = query!
  let response: ExecutionResult<T>
  if (isAdHoc) {
    response = await graphql({schema, source, variableValues, contextValue})
  } else {
    const document = docId ? await documentCache.fromID(docId) : documentCache.fromString(source)
    if (document) {
      response = await execute({schema, document, variableValues, contextValue, rootValue})
    } else {
      response = {errors: [new Error(`DocumentID not found: ${docId}`)] as any}
    }
  }
  dataLoader.dispose()
  return response
}

export default executeGraphQL
