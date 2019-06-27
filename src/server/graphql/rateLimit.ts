import {getUserId} from 'server/utils/authorization'
import standardError from 'server/utils/standardError'
import {GraphQLFieldResolver} from 'graphql'

interface Options {
  perMinute: number
  perHour: number
}
const rateLimit = <TSource = any, TContext = any, TArgs = any>({perMinute, perHour}: Options) => (
  resolve: GraphQLFieldResolver<TSource, TContext, TArgs>
) => (source, args, context, info) => {
  const {authToken, rateLimiter} = context
  const {fieldName, returnType} = info
  const userId = getUserId(authToken)
  // when we scale horizontally & stop using sticky servers, periodically push to redis
  const {lastMinute, lastHour} = rateLimiter.log(userId, fieldName, !!perHour)
  if (lastMinute > perMinute || lastHour > perHour) {
    const returnVal = standardError(new Error('Rate limit reached'), {userId})
    // if (lastMinute > perMinute + 10) {
    // TODO Handle suspected bot by dynamically blacklisting in nginx
    // }
    const baseType = returnType.ofType || returnType
    const fields = baseType.getFields && baseType.getFields()
    if (fields && fields.error) {
      return returnVal
    } else {
      // this will get sanitized before sent to the client
      throw new Error('429 Too Many Requests')
    }
  }
  return resolve(source, args, context, info)
}

export default rateLimit
