import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import removeTeamsLimitObjects from '../../../billing/helpers/removeTeamsLimitObjects'
import getKysely from '../../../postgres/getKysely'
import {toCreditCard} from '../../../postgres/helpers/toCreditCard'
import publish from '../../../utils/publish'
import {getStripeManager} from '../../../utils/stripe'
import getCCFromCustomer from '../../mutations/helpers/getCCFromCustomer'
import type {MutationResolvers} from '../resolverTypes'

// included here to codegen has access to it
export type UpgradeToTeamTierSuccessSource = {
  orgId: string
  teamIds: string[]
}

const upgradeToTeamTier: MutationResolvers['upgradeToTeamTier'] = async (
  _source,
  {invoiceId, userId},
  {dataLoader, socketId: mutatorId}
) => {
  const manager = getStripeManager()
  const invoice = await manager.retrieveInvoice(invoiceId)
  const stripeId = invoice.customer as string
  const stripeSubscriptionId = invoice.subscription as string
  const customer = await manager.retrieveCustomer(stripeId)

  if (customer.deleted) {
    throw new GraphQLError('Customer has been deleted', {extensions: {code: 'CONFLICT'}})
  }
  const orgId = customer.metadata.orgId
  if (!orgId) {
    throw new GraphQLError('Customer does not have an orgId', {extensions: {code: 'CONFLICT'}})
  }

  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const organization = await dataLoader.get('organizations').loadNonNull(orgId)
  const {tier: oldTier} = organization

  if (oldTier === 'enterprise') {
    throw new GraphQLError("Can not change an org's plan from enterprise to team", {
      extensions: {code: 'CONFLICT'}
    })
  }

  // RESOLUTION
  // the customer could've changed CCs, so go through the whole update process
  const creditCard = await getCCFromCustomer(customer)
  await Promise.all([
    pg
      .updateTable('Organization')
      .set({
        creditCard: toCreditCard(creditCard),
        isPaid: true,
        tier: 'team',
        tierLimitExceededAt: null,
        scheduledLockAt: null,
        lockedAt: null,
        trialStartDate: null,
        stripeId,
        stripeSubscriptionId
      })
      .where('id', '=', orgId)
      .execute(),
    removeTeamsLimitObjects(orgId, dataLoader)
  ])
  organization.tier = 'team'

  if (userId) {
    await pg
      .updateTable('OrganizationUser')
      .set({role: 'BILLING_LEADER'})
      .where('userId', '=', userId)
      .where('orgId', '=', orgId)
      .where('removedAt', 'is', null)
      .execute()
  }
  if (oldTier === 'team') {
    throw new GraphQLError('Org is already on team tier', {extensions: {code: 'CONFLICT'}})
  }

  const teams = await dataLoader.get('teamsByOrgIds').load(orgId)
  const teamIds = teams.map(({id}) => id)
  const data = {orgId, teamIds}
  publish(SubscriptionChannel.ORGANIZATION, orgId, 'UpgradeToTeamTierSuccess', data, subOptions)

  return data
}

export default upgradeToTeamTier
