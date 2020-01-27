import {InvoiceItemType} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
import Notification from '../../../database/types/Notification'
import OrganizationUser from '../../../database/types/OrganizationUser'
import User from '../../../database/types/User'
import {DataLoaderWorker} from '../../graphql'
import removeTeamMember from './removeTeamMember'

const removeFromOrg = async (userId: string, orgId: string, dataLoader: DataLoaderWorker) => {
  const r = await getRethink()
  const now = new Date()
  console.log('uid', userId)
  const teamIds = await r
    .table('Team')
    .getAll(orgId, {index: 'orgId'})('id')
    .run()
  const teamMemberIds = (await r
    .table('TeamMember')
    .getAll(r.args(teamIds), {index: 'teamId'})
    .filter({userId, isNotRemoved: true})('id')
    .run()) as string[]

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
    organizationUser: (r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .filter({orgId, removedAt: null})
      .nth(0)
      .update(
        {removedAt: now},
        {returnChanges: true}
      )('changes')(0)('new_val')
      .default(null) as unknown) as OrganizationUser,
    user: (r.table('User').get(userId) as unknown) as User,
    // remove stale notifications
    allRemovedOrgNotifications: (r
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
      }) as unknown) as {notifications: Notification[]; deletions: any[]}
  }).run()

  // need to make sure the org doc is updated before adjusting this
  const {joinedAt, newUserUntil} = organizationUser
  const prorationDate = newUserUntil >= now ? new Date(joinedAt) : now
  try {
    await adjustUserCount(userId, orgId, InvoiceItemType.REMOVE_USER, {prorationDate})
  } catch (e) {
    console.log(e)
  }
  return {
    tms: user.tms,
    taskIds,
    removedTeamNotifications,
    kickOutNotificationIds,
    allRemovedOrgNotifications,
    teamIds,
    teamMemberIds,
    removedOrgNotifications: allRemovedOrgNotifications.notifications,
    organizationUserId: organizationUser.id
  }
}

export default removeFromOrg
