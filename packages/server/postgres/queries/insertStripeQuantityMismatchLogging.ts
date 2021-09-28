import getPg from '../getPg'
import OrganizationUser from '../../database/types/OrganizationUser'
import {insertStripeQuantityMismatchLoggingQuery} from './generated/insertStripeQuantityMismatchLoggingQuery'

const insertStripeQuantityMismatchLogging = async (
  userId: string,
  eventTime: Date,
  eventType: string,
  stripePreviousQuantity: number,
  stripeNextQuantity: number,
  orgUsers: OrganizationUser[]
) => {
  return insertStripeQuantityMismatchLoggingQuery.run(
    {
      userId,
      eventTime,
      eventType,
      stripePreviousQuantity,
      stripeNextQuantity,
      orgUsers: orgUsers.map(({id, inactive, joinedAt, removedAt, userId, role, tier}) => {
        return {
          id,
          inactive,
          joinedAt: JSON.stringify(joinedAt),
          removedAt: removedAt ? JSON.stringify(removedAt) : "",
          userId,
          role,
          tier
        }
      })
    },
    getPg()
  )
}
export default insertStripeQuantityMismatchLogging
