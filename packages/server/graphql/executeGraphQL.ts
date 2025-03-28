/*
  This is a stateless function that can be broken out into its own microservice to scale
  It is used for all GraphQL queries, both trusted and untrusted
  It is NOT used for subscription source streams, since those require state
  It IS used to transform a source stream into a response stream
 */
import tracer from 'dd-trace'
import {experimentalExecuteIncrementally, parse} from 'graphql'
import type {GQLRequest} from '../types/GQLRequest'
import sendToSentry from '../utils/sendToSentry'
import CompiledQueryCache from './CompiledQueryCache'
import getDataLoader from './getDataLoader'
import getRateLimiter from './getRateLimiter'
import privateSchema from './private/rootSchema'
import publicSchema from './public/rootSchema'

const queryCache = new CompiledQueryCache()

const executeGraphQL = async (req: GQLRequest) => {
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
    rootValue,
    carrier
  } = req
  // never re-use a dataloader since the things it cached may be old
  const ddChildOf = tracer.extract('http_headers', carrier)
  const dataLoader = getDataLoader(dataLoaderId)
  dataLoader.share()
  const rateLimiter = getRateLimiter()
  const contextValue = {ip, authToken, socketId, rateLimiter, dataLoader, ddChildOf}
  const schema = isPrivate ? privateSchema : publicSchema
  const variableValues = variables
  const source = query!
  // if (isAdHoc) {
    // const document = parse(source)
    // const compiledQuery = compileQuery(schema, document)
    // if (!('query' in compiledQuery)) {
    //   console.log('BAD QUERY')
    //   return {
    //     errors: [new Error('Invalid query')]
    //   }
    // }

    // const result = await compiledQuery.query(rootValue, contextValue, variableValues)
    // console.log({result})
    const result = await experimentalExecuteIncrementally({
      schema,
      document: parse(source),
      variableValues,
      contextValue
    })
    if ('errors' in result && result.errors) {
      const [firstError] = result.errors
      sendToSentry(firstError as Error)
    }
    if (!('initialResult' in result)) {
      dataLoader.dispose()
    }
    return result
  // }
  // const compiledQuery = docId
  //   ? await queryCache.fromID(docId, schema)
  //   : queryCache.fromString(source, schema)
  // if (!compiledQuery) {
  //   const message = docId
  //     ? `DocumentID not found: ${docId}`
  //     : `Error parsing query: ${source.slice(0, 40)}...`
  //   return {errors: [new Error(message)] as any}
  // }
  // const result = await compiledQuery.query(rootValue, contextValue, variableValues)
  // dataLoader.dispose()
  // if ('errors' in result && result.errors) {
  //   const [firstError] = result.errors
  //   sendToSentry(firstError as Error)
  // }
  // return result
}

export default executeGraphQL
