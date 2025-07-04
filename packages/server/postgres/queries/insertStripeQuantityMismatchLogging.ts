import getPg from '../getPg'
import {insertStripeQuantityMismatchLoggingQuery} from './generated/insertStripeQuantityMismatchLoggingQuery'

const insertStripeQuantityMismatchLogging = async (
  orgId: string,
  userId: string | null,
  eventTime: Date,
  eventType: string,
  stripePreviousQuantity: number,
  stripeNextQuantity: number
) => {
  return insertStripeQuantityMismatchLoggingQuery.run(
    {
      orgId,
      userId,
      eventTime,
      eventType,
      stripePreviousQuantity,
      stripeNextQuantity
    },
    getPg()
  )
}
export default insertStripeQuantityMismatchLogging
