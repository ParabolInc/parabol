import {sql} from 'kysely'
import {InvoiceItemType} from 'parabol-client/types/constEnums'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
import getKysely from '../../../postgres/getKysely'
import {Logger} from '../../../utils/Logger'
import setUserTierForUserIds from '../../../utils/setUserTierForUserIds'
import {DataLoaderWorker} from '../../graphql'
import removeTeamMember from './removeTeamMember'
import resolveDowngradeToStarter from './resolveDowngradeToStarter'

const removeFromOrg = async (
  userId: string,
  orgId: string,
  evictorUserId: string | undefined,
  dataLoader: DataLoaderWorker
) => {
  const pg = getKysely()
  // TODO consider a teamMembersByOrgId dataloader if this pattern pops up more
  const [orgTeams, allTeamMembers] = await Promise.all([
    dataLoader.get('teamsByOrgIds').load(orgId),
    dataLoader.get('teamMembersByUserId').load(userId)
  ])
  const teamIds = orgTeams.map((team) => team.id)
  const teamMembers = allTeamMembers.filter((teamMember) => teamIds.includes(teamMember.teamId))
  const teamMemberIds = teamMembers.map((teamMember) => teamMember.id)

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
    res.notificationId && arr.push(res.notificationId)
    return arr
  }, [])

  const activeMeetingIds = perTeamRes.reduce((arr: string[], res) => {
    res.activeMeetingIds && arr.push(...res.activeMeetingIds)
    return arr
  }, [])

  const [organizationUser, user] = await Promise.all([
    pg
      .updateTable('OrganizationUser')
      .set({removedAt: sql`CURRENT_TIMESTAMP`})
      .where('userId', '=', userId)
      .where('orgId', '=', orgId)
      .where('removedAt', 'is', null)
      .returning(['id', 'role'])
      .executeTakeFirstOrThrow(),
    dataLoader.get('users').loadNonNull(userId)
  ])
  dataLoader.clearAll('organizationUsers')
  // need to make sure the org doc is updated before adjusting this
  const {role} = organizationUser
  if (role && ['BILLING_LEADER', 'ORG_ADMIN'].includes(role)) {
    const organization = await dataLoader.get('organizations').loadNonNull(orgId)
    // if no other billing leader, promote the oldest
    // if team tier & no other member, downgrade to starter
    const allOrgUsers = await dataLoader.get('organizationUsersByOrgId').load(orgId)
    const otherBillingLeaders = allOrgUsers.filter(
      ({role}) => role && ['BILLING_LEADER', 'ORG_ADMIN'].includes(role)
    )
    if (otherBillingLeaders.length === 0) {
      const orgUsersByJoinAt = allOrgUsers.sort((a, b) => (a.joinedAt < b.joinedAt ? -1 : 1))
      const nextInLine = orgUsersByJoinAt[0]
      if (nextInLine) {
        await pg
          .updateTable('OrganizationUser')
          .set({role: 'BILLING_LEADER'})
          .where('id', '=', nextInLine.id)
          .execute()
      } else if (organization.tier !== 'starter') {
        await resolveDowngradeToStarter(orgId, organization.stripeSubscriptionId!, user, dataLoader)
      }
    }
  }
  try {
    await adjustUserCount(userId, orgId, InvoiceItemType.REMOVE_USER, dataLoader)
  } catch (e) {
    Logger.log(e)
  }
  await setUserTierForUserIds([userId])
  return {
    tms: user?.tms ?? [],
    taskIds,
    kickOutNotificationIds,
    teamIds,
    teamMemberIds,
    organizationUserId: organizationUser.id,
    activeMeetingIds
  }
}

export default removeFromOrg
