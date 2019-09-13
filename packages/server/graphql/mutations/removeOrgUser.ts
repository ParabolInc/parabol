import {GraphQLID, GraphQLNonNull} from 'graphql'
import adjustUserCount from '../../billing/helpers/adjustUserCount'
import getRethink from '../../database/rethinkDriver'
import removeTeamMember from './helpers/removeTeamMember'
import RemoveOrgUserPayload from '../types/RemoveOrgUserPayload'
import {updateAuth0TMS} from '../../utils/auth0Helpers'
import {getUserId, isUserBillingLeader} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {InvoiceItemType, SubscriptionChannel} from 'parabol-client/types/constEnums'
import AuthTokenPayload from '../types/AuthTokenPayload'

const removeOrgUser = {
  type: RemoveOrgUserPayload,
  description: 'Remove a user from an org',
  args: {
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the user to remove'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the org that does not want them anymore'
    }
  },
  async resolve(_source, {orgId, userId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    if (viewerId !== userId) {
      if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
        return standardError(new Error('Must be the organization leader'), {userId: viewerId})
      }
    }

    // RESOLUTION
    const teamIds = await r.table('Team').getAll(orgId, {index: 'orgId'})('id')
    const teamMemberIds = await r
      .table('TeamMember')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter({userId, isNotRemoved: true})('id') as string[]

    const perTeamRes = await Promise.all(
      teamMemberIds.map((teamMemberId) => {
        return removeTeamMember(teamMemberId, {isKickout: true}, dataLoader)
      })
    )

    const taskIds = perTeamRes.reduce((arr: string[], res) => {
      arr.push(...res.archivedTaskIds, ...res.reassignedTaskIds)
      return arr
    }, [])

    const removedTeamNotifications = perTeamRes.reduce((arr: any[], res) => {
      arr.push(...res.removedNotifications)
      return arr
    }, [])

    const kickOutNotificationIds = perTeamRes.reduce((arr: string[], res) => {
      arr.push(res.notificationId)
      return arr
    }, [])

    const {allRemovedOrgNotifications, user, organizationUser} = await r({
      organizationUser: r
        .table('OrganizationUser')
        .getAll(userId, {index: 'userId'})
        .filter({orgId, removedAt: null})
        .nth(0)
        .update({removedAt: now}, {returnChanges: true})('changes')(0)('new_val')
        .default(null),
      user: r.table('User').get(userId),
      // remove stale notifications
      allRemovedOrgNotifications: r
        .table('Notification')
        .getAll(userId, {index: 'userIds'})
        .filter({orgId})
        .update(
          (notification) => ({
            // if this was for many people, remove them from it
            userIds: notification('userIds').filter((id) => id.ne(userId))
          }),
          {returnChanges: true}
        )('changes')('new_val')
        .default([])
        .do((allNotifications) => {
          return {
            notifications: allNotifications,
            // if this was for them, delete it
            deletions: r
              .table('Notification')
              .getAll(r.args(allNotifications('id')), {index: 'id'})
              .filter((notification) =>
                notification('userIds')
                  .count()
                  .eq(0)
              )
              .delete()
          }
        })
    })

    // need to make sure the org doc is updated before adjusting this
    const {joinedAt, newUserUntil} = organizationUser
    const prorationDate = newUserUntil >= now ? new Date(joinedAt) : now
    try {
      await adjustUserCount(userId, orgId, InvoiceItemType.REMOVE_USER, {prorationDate})
    } catch (e) {
      console.log(e)
    }

    const {tms} = user
    publish(SubscriptionChannel.NOTIFICATION, userId, AuthTokenPayload, {tms})
    updateAuth0TMS(userId, tms)
    const data = {
      orgId,
      kickOutNotificationIds,
      teamIds,
      teamMemberIds,
      taskIds,
      removedTeamNotifications,
      removedOrgNotifications: allRemovedOrgNotifications.notifications,
      userId,
      organizationUserId: organizationUser.id
    }

    publish(SubscriptionChannel.ORGANIZATION, orgId, RemoveOrgUserPayload, data, subOptions)
    publish(SubscriptionChannel.NOTIFICATION, userId, RemoveOrgUserPayload, data, subOptions)
    teamIds.forEach((teamId) => {
      const teamData = {...data, teamFilterId: teamId}
      publish(SubscriptionChannel.TEAM, teamId, RemoveOrgUserPayload, teamData, subOptions)
    })

    const remainingTeamMembers = await dataLoader.get('teamMembersByTeamId').loadMany(teamIds)
    remainingTeamMembers.forEach((teamMember) => {
      if (teamMemberIds.includes(teamMember.id)) return
      publish(SubscriptionChannel.TASK, teamMember.userId, RemoveOrgUserPayload, data, subOptions)
    })
    return data
  }
}

export default removeOrgUser
