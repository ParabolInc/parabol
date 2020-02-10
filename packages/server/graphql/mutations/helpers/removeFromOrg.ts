import {InvoiceItemType} from 'parabol-client/types/constEnums'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
import getRethink from '../../../database/rethinkDriver'
import OrganizationUser from '../../../database/types/OrganizationUser'
import User from '../../../database/types/User'
import {DataLoaderWorker} from '../../graphql'
import removeTeamMember from './removeTeamMember'

const removeFromOrg = async (
  userId: string,
  orgId: string,
  evictorUserId: string | undefined,
  dataLoader: DataLoaderWorker
) => {
  const r = await getRethink()
  const now = new Date()
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
      return removeTeamMember(teamMemberId, {evictorUserId}, dataLoader)
    })
  )

  const taskIds = perTeamRes.reduce((arr: string[], res) => {
    arr.push(...res.archivedTaskIds, ...res.reassignedTaskIds)
    return arr
  }, [])

  const kickOutNotificationIds = perTeamRes.reduce((arr: string[], res) => {
    arr.push(res.notificationId)
    return arr
  }, [])

  const {user, organizationUser} = await r({
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
    user: (r.table('User').get(userId) as unknown) as User
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
    kickOutNotificationIds,
    teamIds,
    teamMemberIds,
    organizationUserId: organizationUser.id
  }
}

export default removeFromOrg
