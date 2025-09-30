import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import {getUserId} from '../../../utils/authorization'
import logError from '../../../utils/logError'
import type {GQLContext} from '../../graphql'

interface RateLimitOptions {
  perMinute: number
  perHour: number
}

const rateLimit = ({perMinute, perHour}: RateLimitOptions) =>
  rule(`rateLimit-${perMinute}-${perHour}`, {cache: 'contextual'})(
    (_source, _args, context: GQLContext, info) => {
      const {authToken, rateLimiter, ip} = context
      const {fieldName} = info
      const userId = getUserId(authToken) || ip
      const {lastMinute, lastHour} = rateLimiter.log(userId, fieldName, !!perHour)
      if (lastMinute > perMinute || (lastHour && lastHour > perHour)) {
        const error = new GraphQLError('Too Many Requests. Contact support to increase rate limit')
        logError(error, {ip, userId})
        return error
      }
      return true
    }
  )

export default rateLimit
