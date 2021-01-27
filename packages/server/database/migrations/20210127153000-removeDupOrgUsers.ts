import {R} from 'rethinkdb-ts'
import StripeManager from '../../utils/StripeManager'
import Organization from '../types/Organization'
export const up = async function(r: R) {
  const now = new Date()
  const manager = new StripeManager()
  try {
    const duplicateUserIds = await r
      .table('OrganizationUser')
      .filter({removedAt: null})
      .group('userId', 'orgId')
      .count()
      .ungroup()
      .filter((row) => row('reduction').gt(1))('group')
      .map((row) => row.nth(0)) // just return the userIds, not the orgIds
      .distinct()
      .run()

    const duplicateOrgUsers = await r
      .table('OrganizationUser')
      .getAll(r.args(duplicateUserIds), {index: 'userId'})
      .filter({removedAt: null})
      .group(
        'userId',
        'orgId'
      )('id')
      .run()

    // org users that have been duplicated may be duplicated in one org but not in another
    const duplicateGroupsToRemove = duplicateOrgUsers.filter((user) => user['reduction'].length > 1)

    const orgDups = {} as Record<string, number> // orgId : num of dups to remove
    const orgIds = [] as string[]
    const duplicateOrgUserIds = [] as string[]
    duplicateGroupsToRemove.forEach((dup) => {
      const orgId = dup.group[1]
      const dupsCount = dup.reduction.length
      orgIds.push(orgId)
      const orgUserIds = dup.reduction.slice(1, dupsCount).flat()
      orgUserIds.forEach((orgUserId) => duplicateOrgUserIds.push(orgUserId))
      orgDups[orgId] = dupsCount - 1
    })

    const orgs = (await r
      .table('Organization')
      .getAll(r.args(orgIds))
      .hasFields('stripeSubscriptionId')
      .pluck('id', 'stripeSubscriptionId')
      .run()) as Organization[]

    const updateSubsPromises = orgs.map(async (org) => {
      const {id: orgId, stripeSubscriptionId} = org
      const stripeSubscription = await manager.retrieveSubscription(stripeSubscriptionId)
      if (!stripeSubscription) return
      const stripeQty = stripeSubscription.quantity || 0
      const dupsCount = orgDups[orgId]
      const newStripeQty = Math.max(1, stripeQty - dupsCount)
      return manager.updateSubscriptionQuantity(stripeSubscriptionId, newStripeQty)
    })
    await Promise.all(updateSubsPromises)

    await r
      .table('OrganizationUser')
      .getAll(r.args(duplicateOrgUserIds))
      .update({removedAt: now, removalReason: 'duplicate'})
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  try {
    await r
      .table('OrganizationUser')
      .filter((orgUser) => orgUser('removalReason').eq('duplicate'))
      .update({removedAt: null, removalReason: null})
      .run()
  } catch (e) {
    console.log(e)
  }
}
