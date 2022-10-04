import OrganizationUser from '../../database/types/OrganizationUser'
import getPg from '../getPg'
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
          joinedAt: joinedAt.toJSON(),
          removedAt: removedAt ? removedAt.toJSON() : '',
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
