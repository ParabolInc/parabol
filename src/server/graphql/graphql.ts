import {DocumentNode, GraphQLFieldResolver, GraphQLSchema} from 'graphql'
import {parse} from 'graphql/language/parser'
import {execute} from 'graphql/execution/execute'
import Maybe from 'graphql/tsutils/Maybe'
import {validateSchema} from 'graphql/type/validate'
import {validate} from 'graphql/validation/validate'
import {IAuthToken} from '../../universal/types/graphql'
import RateLimiter from './RateLimiter'

// Avoid needless parsing & validating for the 300 hottest operations
interface DocumentCache {
  [key: string]: DocumentNode
}

let documentCache: DocumentCache = {}
const MAX_CACHE_SIZE = 300

interface Context {
  authToken: IAuthToken
  socketId?: string
  dataLoader: any
  rateLimiter: RateLimiter
}
const graphql = async (
  schema: GraphQLSchema,
  source: string,
  rootValue: any,
  contextValue: Context,
  variableValues: {[key: string]: any},
  operationName?: string,
  fieldResolver?: Maybe<GraphQLFieldResolver<any, any>>
) => {
  const schemaValidationErrors = validateSchema(schema)
  if (schemaValidationErrors.length > 0) {
    return {errors: schemaValidationErrors}
  }

  // Parse
  let document = documentCache[source]
  if (!document) {
    try {
      document = parse(source)
    } catch (syntaxError) {
      return {errors: [syntaxError]}
    }

    // Validate
    const validationErrors = validate(schema, document)
    if (validationErrors.length > 0) {
      return {errors: validationErrors}
    }

    // Maybe GC the cache
    documentCache[source] = document
    if (Object.keys(documentCache).length > MAX_CACHE_SIZE) {
      documentCache = {}
    }
  }

  // Execute
  return execute(
    schema,
    document,
    rootValue,
    contextValue,
    variableValues,
    operationName,
    fieldResolver
  )
}

export default graphql
