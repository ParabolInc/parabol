import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import SetOrgUserRolePayload from 'server/graphql/types/SetOrgUserRolePayload'
import {getUserOrgDoc, isOrgBillingLeader} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import shortid from 'shortid'
import {
  BILLING_LEADER,
  billingLeaderTypes,
  ORGANIZATION,
  PROMOTE_TO_BILLING_LEADER,
  REQUEST_NEW_USER
} from 'universal/utils/constants'
import {sendOrgLeadAccessError} from 'server/utils/authorizationErrors'
import sendAuthRaven from 'server/utils/sendAuthRaven'
import {sendSegmentIdentify} from 'server/utils/sendSegmentEvent'
import approveToOrg from 'server/graphql/mutations/approveToOrg'

const approveToOrgForUserId = async (orgId, userId, authToken, dataLoader) => {
  const r = getRethink()
  const outstandingNotifications = await r
    .table('Notification')
    .getAll(orgId, {index: 'orgId'})
    .filter({
      type: REQUEST_NEW_USER,
      inviterUserId: userId
    })
    .default([])
  return Promise.all(
    outstandingNotifications.map((notification) => {
      // a quick & dirty way to accomplish all the approvals.
      // the person that promoted someone to billing leader is the same person that approves the invitees
      // the updates are sent via socket, not mutation response
      return approveToOrg.resolve(
        {},
        {email: notification.inviteeEmail, orgId},
        {authToken, dataLoader}
      )
    })
  )
}

export default {
  type: SetOrgUserRolePayload,
  description: 'Set the role of a user',
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The org to affect'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the user who is receiving a role change'
    },
    role: {
      type: GraphQLString,
      description: 'the user’s new role'
    }
  },
  async resolve (source, {orgId, userId, role}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    // AUTH
    const userOrgDoc = await getUserOrgDoc(authToken.sub, orgId)
    if (!isOrgBillingLeader(userOrgDoc)) {
      return sendOrgLeadAccessError(authToken, userOrgDoc)
    }

    // VALIDATION
    if (role && role !== BILLING_LEADER) {
      const breadcrumb = {
        message: 'Invalid role',
        category: 'Unauthorized Access',
        data: {role, orgId, userId}
      }
      return sendAuthRaven(authToken, 'Set org user role', breadcrumb)
    }
    // if someone is leaving, make sure there is someone else to take their place
    if (userId === authToken.sub) {
      const leaderCount = await r
        .table('Organization')
        .get(orgId)('orgUsers')
        .filter({
          role: BILLING_LEADER
        })
        .count()
      if (leaderCount === 1) {
        const breadcrumb = {
          message: 'You’re the last leader, you can’t give that up',
          category: 'Unauthorized Access',
          data: {role, orgId, userId}
        }
        return sendAuthRaven(authToken, 'Set org user role', breadcrumb)
      }
    }

    // RESOLUTION
    const {organizationChanges} = await r({
      userOrgsUpdate: r
        .table('User')
        .get(userId)
        .update((user) => ({
          userOrgs: user('userOrgs').map((userOrg) => {
            return r.branch(
              userOrg('id').eq(orgId),
              userOrg.merge({
                role
              }),
              userOrg
            )
          }),
          updatedAt: now
        })),
      organizationChanges: r
        .table('Organization')
        .get(orgId)
        .update(
          (org) => ({
            orgUsers: org('orgUsers').map((orgUser) => {
              return r.branch(
                orgUser('id').eq(userId),
                orgUser.merge({
                  role
                }),
                orgUser
              )
            }),
            updatedAt: now
          }),
          {returnChanges: true}
        )('changes')(0)
    })
    const {old_val: oldOrg, new_val: organization} = organizationChanges
    const oldUser = oldOrg.orgUsers.find((orgUser) => orgUser.id === userId)
    const newUser = organization.orgUsers.find((orgUser) => orgUser.id === userId)
    if (oldUser.role === newUser.role) {
      return null
    }
    if (role === BILLING_LEADER) {
      const promotionNotificationId = shortid.generate()
      const promotionNotification = {
        id: promotionNotificationId,
        type: PROMOTE_TO_BILLING_LEADER,
        startAt: now,
        orgId,
        userIds: [userId]
      }
      await approveToOrgForUserId(orgId, userId, authToken, dataLoader)
      const {existingNotificationIds} = await r({
        insert: r.table('Notification').insert(promotionNotification),
        existingNotificationIds: r
          .table('Notification')
          .getAll(orgId, {index: 'orgId'})
          .filter((notification) => r.expr(billingLeaderTypes).contains(notification('type')))
          .update(
            (notification) => ({
              userIds: notification('userIds').append(userId)
            }),
            {returnChanges: true}
          )('changes')('new_val')
          .default([])
      })
      const notificationIdsAdded = existingNotificationIds.concat(promotionNotificationId)
      // add the org to the list of owned orgs
      const data = {orgId, userId, notificationIdsAdded}
      publish(ORGANIZATION, userId, SetOrgUserRolePayload, data, subOptions)
      publish(ORGANIZATION, orgId, SetOrgUserRolePayload, data, subOptions)
      await sendSegmentIdentify(userId)
      return data
    }
    if (role === null) {
      const {oldPromotion, removedNotifications} = await r({
        oldPromotion: r
          .table('Notification')
          .getAll(userId, {index: 'userIds'})
          .filter({
            orgId,
            type: PROMOTE_TO_BILLING_LEADER
          })
          .delete({returnChanges: true})('changes')(0)('old_val')
          .default([]),
        removedNotifications: r
          .table('Notification')
          .getAll(orgId, {index: 'orgId'})
          .filter((notification) => r.expr(billingLeaderTypes).contains(notification('type')))
          .update(
            (notification) => ({
              userIds: notification('userIds').filter((id) => id.ne(userId))
            }),
            {returnChanges: true}
          )('changes')('new_val')
          .default([])
      })
      const notificationsRemoved = removedNotifications.concat(oldPromotion)
      const data = {orgId, userId, notificationsRemoved}
      publish(ORGANIZATION, userId, SetOrgUserRolePayload, data, subOptions)
      publish(ORGANIZATION, orgId, SetOrgUserRolePayload, data, subOptions)
      await sendSegmentIdentify(userId)
      return data
    }
    return null
  }
}
