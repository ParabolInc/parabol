import {InvoiceItemType} from 'parabol-client/types/constEnums'
import {TierEnum} from 'parabol-client/types/graphql'
import getRethink from '../../database/rethinkDriver'
import InvoiceItemHook from '../../database/types/InvoiceItemHook'
import Organization from '../../database/types/Organization'
import OrganizationUser from '../../database/types/OrganizationUser'
import {toEpochSeconds} from '../../utils/epochTime'
import handleEnterpriseOrgQuantityChanges from './handleEnterpriseOrgQuantityChanges'
import processInvoiceItemHook from './processInvoiceItemHook'

const changePause = (inactive: boolean) => async (_orgIds: string[], userId: string) => {
  const r = await getRethink()
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
  }).run()
}

const addUser = async (orgIds: string[], userId: string) => {
  const r = await getRethink()
  const {organizations, organizationUsers} = await r({
    organizationUsers: (r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .orderBy(r.desc('newUserUntil'))
      .coerceTo('array') as unknown) as OrganizationUser[],
    organizations: (r
      .table('Organization')
      .getAll(r.args(orgIds))
      .coerceTo('array') as unknown) as Organization[]
  }).run()
  const docs = orgIds.map((orgId) => {
    const oldOrganizationUser = organizationUsers.find(
      (organizationUser) => organizationUser.orgId === orgId
    )
    const organization = organizations.find((organization) => organization.id === orgId)!
    // continue the grace period from before, if any OR set to the end of the invoice OR (if it is a free account) no grace period
    const newUserUntil =
      (oldOrganizationUser && oldOrganizationUser.newUserUntil) ||
      organization.periodEnd ||
      new Date()
    return new OrganizationUser({orgId, userId, newUserUntil})
  })
  return r
    .table('OrganizationUser')
    .insert(docs)
    .run()
}

const deleteUser = async (orgIds: string[], userId: string) => {
  const r = await getRethink()
  return r
    .table('OrganizationUser')
    .getAll(userId, {index: 'userId'})
    .filter((row) => r.expr(orgIds).contains(row('orgId')))
    .update({
      removedAt: new Date()
    })
    .run()
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

export default async function adjustUserCount(
  userId: string,
  orgInput: string | string[],
  type: InvoiceItemType,
  options: Options = {}
) {
  const r = await getRethink()
  const orgIds = Array.isArray(orgInput) ? orgInput : [orgInput]
  const dbAction = typeLookup[type]
  await dbAction(orgIds, userId)
  const paidOrgs = await r
    .table('Organization')
    .getAll(r.args(orgIds), {index: 'id'})
    .filter((org) =>
      org('stripeSubscriptionId')
        .default(null)
        .ne(null)
    )
    .run()

  const proOrgs = paidOrgs.filter((org) => org.tier === TierEnum.pro)
  handleEnterpriseOrgQuantityChanges(paidOrgs).catch()
  // personal & enterprise tiers do not follow the per-seat model
  if (proOrgs.length === 0) return
  if (type === InvoiceItemType.REMOVE_USER) {
    // if the user is paused, they've already been removed from stripe
    const user = await r
      .table('User')
      .get(userId)
      .run()
    if (user.inactive) {
      return
    }
  }

  const prorationDate = options.prorationDate ? toEpochSeconds(options.prorationDate) : undefined
  const hooks = proOrgs.map((org) => {
    return new InvoiceItemHook({
      stripeSubscriptionId: org.stripeSubscriptionId!,
      isProrated: org.tier !== TierEnum.enterprise,
      orgId: org.id,
      prorationDate,
      type,
      userId
    })
  })

  await r
    .table('InvoiceItemHook')
    .insert(hooks)
    .run()

  hooks.forEach((hook) => {
    processInvoiceItemHook(hook.stripeSubscriptionId).catch()
  })
}
