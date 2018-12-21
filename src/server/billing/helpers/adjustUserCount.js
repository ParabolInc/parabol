import getRethink from 'server/database/rethinkDriver'
import {
  ADD_USER,
  AUTO_PAUSE_USER,
  NEW_USER_GRACE_PERIOD,
  PAUSE_USER,
  REMOVE_USER,
  UNPAUSE_USER
} from 'server/utils/serverConstants'
import stripe from 'server/billing/stripe'
import shortid from 'shortid'
import {toEpochSeconds} from 'server/utils/epochTime'
import {sendSegmentIdentify} from 'server/utils/sendSegmentEvent'

const changePause = (inactive) => (orgIds, userId) => {
  const r = getRethink()
  return r({
    user: r
      .table('User')
      .get(userId)
      .update({inactive}),
    orgUser: r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .update({inactive}, {returnChanges: true})
  })
}

const addUser = (orgIds, userId) => {
  const r = getRethink()
  const docs = orgIds.map((orgId) => ({
    id: `${orgId}::${userId}`,
    inactive: false,
    joinedAt: new Date(),
    newUserUntil: new Date(Date.now() + NEW_USER_GRACE_PERIOD),
    orgId,
    role: null,
    userId
  }))
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
  [ADD_USER]: addUser,
  [AUTO_PAUSE_USER]: changePause(true),
  [PAUSE_USER]: changePause(true),
  [REMOVE_USER]: deleteUser,
  [UNPAUSE_USER]: changePause(false)
}

export default async function adjustUserCount (userId, orgInput, type) {
  const r = getRethink()
  const now = new Date()

  const orgIds = Array.isArray(orgInput) ? orgInput : [orgInput]
  const dbAction = typeLookup[type]
  await dbAction(orgIds, userId)
  const orgs = await r
    .table('Organization')
    .getAll(r.args(orgIds), {index: 'id'})
    .merge((organization) => ({
      quantity: r
        .table('OrganizationUser')
        .getAll(organization('id'), {index: 'orgId'})
        .filter((row) =>
          row('removedAt')
            .default(null)
            .ne(null)
        )
        .filter({
          inactive: false,
          removedAt: null
        })
        .count()
    }))
  const prorationDate = toEpochSeconds(now)
  const hooks = orgs.reduce((arr, org) => {
    const {stripeSubscriptionId} = org
    if (stripeSubscriptionId) {
      arr.push({
        id: shortid.generate(),
        stripeSubscriptionId: org.stripeSubscriptionId,
        prorationDate,
        type,
        userId
      })
    }
    return arr
  }, [])
  // wait here to make sure the webhook finds what it's looking for
  await r.table('InvoiceItemHook').insert(hooks)
  const stripePromises = orgs.reduce((arr, org) => {
    const {quantity, stripeSubscriptionId} = org
    if (stripeSubscriptionId) {
      arr.push(
        stripe.subscriptions.update(stripeSubscriptionId, {
          proration_date: prorationDate,
          quantity
        })
      )
    }
    return arr
  }, [])

  await Promise.all(stripePromises)
  // publish any changes to user traits (like tier counts) to segment:
  await sendSegmentIdentify(userId)
}
