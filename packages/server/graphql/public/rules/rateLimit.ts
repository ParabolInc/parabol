import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import {getUserId} from '../../../utils/authorization'
import type {RuleContext} from '../../graphql'

interface RateLimitOptions {
  perMinute: number
  perHour: number
  cache?: 'contextual' | 'strict'
}

const rateLimit = ({perMinute, perHour, cache = 'contextual'}: RateLimitOptions) =>
  rule(`rateLimit-${perMinute}-${perHour}-${cache}`, {cache})(
    (_source, _args, context: RuleContext, info) => {
      const {authToken, rateLimiter, ip} = context
      const {fieldName} = info
      const userId = getUserId(authToken) || ip
      const {lastMinute, lastHour} = rateLimiter.log(userId, fieldName, !!perHour)
      if (lastMinute > perMinute || (lastHour && lastHour > perHour)) {
        return new GraphQLError('Too Many Requests. Contact support to increase rate limit', {
          extensions: {code: 'TOO_MANY_REQUESTS'}
        })
      }
      return true
    }
  )

export default rateLimit
