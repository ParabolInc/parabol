import {
  type GraphQLFieldResolver,
  type GraphQLNonNull,
  type GraphQLObjectType,
  type GraphQLOutputType,
  type GraphQLResolveInfo,
  GraphQLUnionType
} from 'graphql'
import {getUserId} from '../utils/authorization'
import standardError from '../utils/standardError'
import type {GQLContext} from './graphql'

interface Options {
  perMinute: number
  perHour: number
}

const hasErrorField = (type?: GraphQLOutputType) => {
  if (!type) {
    return false
  }
  if ((type as GraphQLNonNull<GraphQLObjectType>)?.ofType) {
    return hasErrorField((type as GraphQLNonNull<GraphQLObjectType>)?.ofType)
  }
  if (type instanceof GraphQLUnionType) {
    return type.getTypes().some(hasErrorField)
  }

  const fields = (type as GraphQLObjectType)?.getFields?.()
  if (fields?.error) {
    return true
  }
  return false
}

const rateLimit =
  <TSource = any, TContext = GQLContext, TArgs = any>({perMinute, perHour}: Options) =>
  (resolve: GraphQLFieldResolver<TSource, TContext, TArgs>) =>
  (source: TSource, args: TArgs, context: GQLContext, info: GraphQLResolveInfo) => {
    const {authToken, rateLimiter, ip} = context
    const {fieldName, returnType} = info
    const userId = getUserId(authToken) || ip
    // when we scale horizontally & stop using sticky servers, periodically push to redis
    const {lastMinute, lastHour} = rateLimiter.log(userId, fieldName, !!perHour)
    if (lastMinute > perMinute || (lastHour && lastHour > perHour)) {
      const returnVal = standardError(new Error('Rate limit reached'), {
        userId,
        tags: {query: fieldName, variables: JSON.stringify(args)}
      })
      // if (lastMinute > perMinute + 10) {
      // TODO Handle suspected bot by dynamically blacklisting in nginx
      // }
      if (hasErrorField(returnType)) {
        return returnVal
      } else {
        // this will get sanitized before sent to the client
        throw new Error('429 Too Many Requests')
      }
    }
    return resolve(source, args, context as any, info)
  }

export default rateLimit
