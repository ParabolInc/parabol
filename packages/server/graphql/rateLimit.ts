import {
  GraphQLFieldResolver,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLResolveInfo
} from 'graphql'
import {getUserId} from '../utils/authorization'
import standardError from '../utils/standardError'
import {GQLContext} from './graphql'

interface Options {
  perMinute: number
  perHour: number
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
      const baseType = ((returnType as GraphQLNonNull<GraphQLOutputType>).ofType ||
        returnType) as GraphQLObjectType
      const fields = baseType.getFields && baseType.getFields()
      if (fields && fields.error) {
        return returnVal
      } else {
        // this will get sanitized before sent to the client
        throw new Error('429 Too Many Requests')
      }
    }
    return resolve(source, args, context as any, info)
  }

export default rateLimit
