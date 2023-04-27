import {MONTHLY_PRICE} from 'parabol-client/utils/constants'
import {getUserById} from '../../../postgres/queries/getUsersByIds'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {getStripeManager} from '../../../utils/stripe'
import {MutationResolvers} from '../resolverTypes'

const createSetupIntent: MutationResolvers['createSetupIntent'] = async () => {
  const manager = getStripeManager()
  const setupIntent = await manager.createSetupIntent()

  const {client_secret: clientSecret} = setupIntent
  const data = {clientSecret}
  return data
}

export default createSetupIntent
