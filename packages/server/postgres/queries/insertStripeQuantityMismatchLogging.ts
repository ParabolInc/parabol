import getPg from '../getPg'
import {OrganizationUser} from '../types'
import {insertStripeQuantityMismatchLoggingQuery} from './generated/insertStripeQuantityMismatchLoggingQuery'

const insertStripeQuantityMismatchLogging = async (
  orgId: string,
  userId: string | null,
  eventTime: Date,
  eventType: string,
  stripePreviousQuantity: number,
  stripeNextQuantity: number,
  orgUsers: OrganizationUser[]
) => {
  return insertStripeQuantityMismatchLoggingQuery.run(
    {
      orgId,
      userId,
      eventTime,
      eventType,
      stripePreviousQuantity,
      stripeNextQuantity,
      orgUsers: orgUsers.map(({id, inactive, joinedAt, removedAt, userId, role}) => {
        return {
          id,
          inactive,
          joinedAt: joinedAt.toJSON(),
          removedAt: removedAt ? removedAt.toJSON() : '',
          userId,
          role
        }
      })
    },
    getPg()
  )
}
export default insertStripeQuantityMismatchLogging
