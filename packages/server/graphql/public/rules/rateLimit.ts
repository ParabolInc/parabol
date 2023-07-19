import {rule} from 'graphql-shield'
import {getUserId} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'

interface RateLimitOptions {
  perMinute: number
  perHour: number
}

const rateLimit = ({perMinute, perHour}: RateLimitOptions) =>
  rule({cache: 'contextual'})((_source, _args, context: GQLContext, info) => {
    const {authToken, rateLimiter, ip} = context
    const {fieldName} = info
    const userId = getUserId(authToken) || ip
    const {lastMinute, lastHour} = rateLimiter.log(userId, fieldName, !!perHour)
    if (lastMinute > perMinute || (lastHour && lastHour > perHour)) {
      return new Error('429 Too Many Requests')
    }
    return true
  })

export default rateLimit
