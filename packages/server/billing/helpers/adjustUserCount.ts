import getRethink from '../../database/rethinkDriver'
import {toEpochSeconds} from '../../utils/epochTime'
import {sendSegmentIdentify} from '../../utils/sendSegmentEvent'
import InvoiceItemHook from '../../database/types/InvoiceItemHook'
import {InvoiceItemType} from 'parabol-client/types/constEnums'
import StripeManager from '../../utils/StripeManager'
import {IOrganization, TierEnum} from 'parabol-client/types/graphql'
import OrganizationUser from '../../database/types/OrganizationUser'

const changePause = (inactive) => (_orgIds, userId) => {
  const r = getRethink()
  return r({
    user: r
      .table('User')
      .get(userId)
      .update({inactive}),
    organizationUser: r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .filter({removedAt: null})
      .update({inactive})
  })
}

const addUser = async (orgIds, userId) => {
  const r = getRethink()
  const {organizations, organizationUsers} = await r({
    organizationUsers: r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .orderBy(r.desc('newUserUntil'))
      .coerceTo('array'),
    organizations: r
      .table('Organization')
      .getAll(r.args(orgIds))
      .coerceTo('array')
  })
  const docs = orgIds.map((orgId) => {
    const oldOrganizationUser = organizationUsers.find(
      (organizationUser) => organizationUser.orgId === orgId
    )
    const organization = organizations.find((organization) => organization.id === orgId)
    // continue the grace period from before, if any OR set to the end of the invoice OR (if it is a free account) no grace period
    const newUserUntil = (oldOrganizationUser && oldOrganizationUser.newUserUntil) ||
      organization.periodEnd ||
      new Date()
    return new OrganizationUser({orgId, userId, newUserUntil})
  })
  return r.table('OrganizationUser').insert(docs)
}

const deleteUser = (orgIds, userId) => {
  const r = getRethink()
  return r
    .table('OrganizationUser')
    .getAll(userId, {index: 'userId'})
    .filter((row) => r.expr(orgIds).contains(row('orgId')))
    .update({
      removedAt: new Date()
    })
}

const typeLookup = {
  [InvoiceItemType.ADD_USER]: addUser,
  [InvoiceItemType.AUTO_PAUSE_USER]: changePause(true),
  [InvoiceItemType.PAUSE_USER]: changePause(true),
  [InvoiceItemType.REMOVE_USER]: deleteUser,
  [InvoiceItemType.UNPAUSE_USER]: changePause(false)
}

interface Options {
  prorationDate?: Date
}

interface OrgWithQty extends IOrganization {
  quantity: number
  stripeSubscriptionId: string
}

export default async function adjustUserCount (userId: string, orgInput: string | string[], type: InvoiceItemType, options: Options = {}) {
  const r = getRethink()

  const orgIds = Array.isArray(orgInput) ? orgInput : [orgInput]
  const dbAction = typeLookup[type]
  await dbAction(orgIds, userId)
  const orgs = await r
    .table('Organization')
    .getAll(r.args(orgIds), {index: 'id'})
    .filter((org) => org('stripeSubscriptionId').default(null).ne(null))
    .merge((organization) => ({
      quantity: r
        .table('OrganizationUser')
        .getAll(organization('id'), {index: 'orgId'})
        .filter({
          inactive: false,
          removedAt: null
        })
        .count()
    })) as OrgWithQty[]

  const now = new Date()
  const prorationDate = toEpochSeconds(type === InvoiceItemType.REMOVE_USER ? options.prorationDate! : now)
  const hooks = orgs.map((org) => {
    return new InvoiceItemHook({stripeSubscriptionId: org.stripeSubscriptionId, prorationDate, type, userId, quantity: org.quantity})
  })
  // wait here to make sure the webhook finds what it's looking for
  await r.table('InvoiceItemHook').insert(hooks)
  const manager = new StripeManager()
  await Promise.all(orgs.map((org) => {
    const {stripeSubscriptionId, quantity, tier} = org
    const proProrationDate = tier === TierEnum.enterprise ? undefined : prorationDate
    return manager.updateSubscriptionQuantity(stripeSubscriptionId, quantity, proProrationDate)
  }))
  // publish any changes to user traits (like tier counts) to segment:
  await sendSegmentIdentify(userId)
}
