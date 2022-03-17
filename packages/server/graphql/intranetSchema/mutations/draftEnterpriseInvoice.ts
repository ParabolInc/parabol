import {GraphQLID, GraphQLInt, GraphQLNonNull} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import updateTeamByOrgId from '../../../postgres/queries/updateTeamByOrgId'
import IUser from '../../../postgres/types/IUser'
import {requireSU} from '../../../utils/authorization'
import {fromEpochSeconds} from '../../../utils/epochTime'
import segmentIo from '../../../utils/segmentIo'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import StripeManager from '../../../utils/StripeManager'
import {DataLoaderWorker, GQLContext} from '../../graphql'
import isValid from '../../isValid'
import hideConversionModal from '../../mutations/helpers/hideConversionModal'
import DraftEnterpriseInvoicePayload from '../types/DraftEnterpriseInvoicePayload'

const getBillingLeaderUser = async (
  email: string | null | undefined,
  orgId: string,
  dataLoader: DataLoaderWorker
) => {
  const r = await getRethink()
  if (email) {
    const user = await getUserByEmail(email)
    if (!user) {
      throw new Error('User for email not found')
    }
    const {id: userId} = user
    const organizationUser = await dataLoader
      .get('organizationUsersByUserIdOrgId')
      .load({userId, orgId})
    if (!organizationUser) {
      throw new Error('Email not associated with a user on that org')
    }
    await r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .filter({removedAt: null, orgId})
      .update({role: 'BILLING_LEADER'})
      .run()
    return user
  }
  const organizationUsers = await dataLoader.get('organizationUsersByOrgId').load(orgId)
  const billingLeaders = organizationUsers.filter(
    (organizationUser) => organizationUser.role === 'BILLING_LEADER'
  )

  const billingLeaderUserIds = billingLeaders.map(({userId}) => userId)
  const billingLeaderUsers = (await dataLoader.get('users').loadMany(billingLeaderUserIds)).filter(
    isValid
  )
  return billingLeaderUsers[0]
}

export default {
  type: DraftEnterpriseInvoicePayload,
  description:
    'Create a stripe customer & subscription in stripe, send them an invoice for an enterprise license',
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the org requesting the upgrade'
    },
    quantity: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of users the license grants the organization'
    },
    email: {
      type: GraphQLID,
      description: 'Email address of billing leader, if different from the org billing leader'
    },
    apEmail: {
      type: GraphQLID,
      description:
        'The email address for Accounts Payable. Use only if the invoice will be sent to a non-user!'
    },
    plan: {
      type: GraphQLID,
      description: 'the stripe id of the plan in stripe, if not using the default plan'
    }
  },
  async resolve(
    _source: unknown,
    {
      orgId,
      quantity,
      email,
      apEmail,
      plan
    }: {orgId: string; quantity: number; email?: string; apEmail?: string; plan?: string},
    {authToken, dataLoader}: GQLContext
  ) {
    const r = await getRethink()
    const now = new Date()
    // const operationId = dataLoader.share()

    // AUTH
    requireSU(authToken)

    // VALIDATION
    if (quantity < 1) {
      return {error: {message: 'quantity must be a positive integer'}}
    }

    const org = await dataLoader.get('organizations').load(orgId)
    if (!org) {
      return {error: {message: 'Invalid orgId'}}
    }

    const {stripeId, stripeSubscriptionId, tier} = org
    if (tier === 'enterprise') {
      return {error: {message: 'Org is already enterprise'}}
    }
    // TODO handle upgrade from PRO to ENTERPRISE
    if (tier !== 'personal') {
      return {error: {message: 'Upgrading from PRO not supported. requires PR'}}
    }
    if (stripeSubscriptionId) {
      return {error: {message: 'Tier not PRO but subscription ID found. Big Error.'}}
    }

    // RESOLUTION
    let user: IUser | undefined
    try {
      user = await getBillingLeaderUser(email, orgId, dataLoader)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to get billing leader user'
      return {error: {message}}
    }
    if (!user) {
      return {error: {message: 'User not found'}}
    }
    const manager = new StripeManager()
    let customerId
    if (!stripeId) {
      // create the customer
      const customer = await manager.createCustomer(orgId, apEmail || user.email)
      await r.table('Organization').get(orgId).update({stripeId: customer.id}).run()
      customerId = customer.id
    } else {
      customerId = stripeId
    }

    const subscription = await manager.createEnterpriseSubscription(
      customerId,
      orgId,
      quantity,
      plan
    )

    await Promise.all([
      r({
        updatedOrg: r
          .table('Organization')
          .get(orgId)
          .update({
            periodEnd: fromEpochSeconds(subscription.current_period_end),
            periodStart: fromEpochSeconds(subscription.current_period_start),
            stripeSubscriptionId: subscription.id,
            tier: 'enterprise',
            updatedAt: now
          }),
        teamIds: r.table('Team').getAll(orgId, {index: 'orgId'}).update({
          isPaid: true,
          tier: 'enterprise',
          updatedAt: now
        })
      }).run(),
      updateTeamByOrgId(
        {
          isPaid: true,
          tier: 'enterprise',
          updatedAt: now
        },
        orgId
      )
    ])

    await Promise.all([
      setUserTierForOrgId(orgId),
      setTierForOrgUsers(orgId),
      hideConversionModal(orgId, dataLoader)
    ])
    segmentIo.track({
      userId: user.id,
      event: 'Enterprise invoice drafted',
      properties: {orgId}
    })
    dataLoader.get('organizations').clear(orgId)
    return {orgId}
  }
}
