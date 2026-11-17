import {sql} from 'kysely'
import {InvoiceItemType} from 'parabol-client/types/constEnums'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
import getKysely from '../../../postgres/getKysely'
import {Logger} from '../../../utils/Logger'
import {revalidateYjsConnections} from '../../../utils/tiptap/revalidateYjsConnections'
import type {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import reassignMeetingSeriesOwner from './reassignMeetingSeriesOwner'
import removeTeamMembers from './removeTeamMembers'
import resolveDowngradeToStarter from './resolveDowngradeToStarter'

const removeFromOrg = async (
  userIds: string[],
  orgId: string,
  evictorUserId: string | undefined,
  dataLoader: DataLoaderWorker
) => {
  const pg = getKysely()
  // TODO consider a teamMembersByOrgId dataloader if this pattern pops up more
  const [orgTeams, teamMembersByUser] = await Promise.all([
    dataLoader.get('teamsByOrgIds').load(orgId),
    dataLoader.get('teamMembersByUserId').loadMany(userIds)
  ])
  const orgTeamIds = orgTeams.map((team) => team.id)
  const teamMembers = teamMembersByUser
    .filter(isValid)
    .flat()
    .filter((teamMember) => orgTeamIds.includes(teamMember.teamId))
  const teamMemberIds = teamMembers.map((teamMember) => teamMember.id)
  const teamIds = [...new Set(teamMembers.map((teamMember) => teamMember.teamId))]

  // use allSettled so that if one team fails, we still remove the users from other teams
  const perTeamSettled = await Promise.allSettled(
    teamIds.map((teamId) => {
      const teamUserIds = teamMembers
        .filter((teamMember) => teamMember.teamId === teamId)
        .map(({userId}) => userId)
      return removeTeamMembers(teamId, teamUserIds, {evictorUserId}, dataLoader)
    })
  )
  const teamFailures = perTeamSettled.filter((res) => res.status === 'rejected')
  if (teamFailures.length > 0) {
    // Bail before touching the OrganizationUser. Leaving them on a team in an org they're no longer
    // a member of passes isTeamMember but fails isViewerOnOrg, breaking org-scoped fields like
    // Team.organization for them. Staying in the org is recoverable, this is not
    Logger.error(
      `removeFromOrg: could not remove ${userIds.join(', ')} from every team in org ${orgId}`,
      teamFailures.map((res) => res.reason)
    )
    throw new Error('Failed to remove the users from every team in the organization')
  }
  const perTeamRes = perTeamSettled
    .filter((res) => res.status === 'fulfilled')
    .map((res) => res.value)
  const taskIds = perTeamRes.flatMap((res) => [...res.archivedTaskIds, ...res.reassignedTaskIds])
  const kickOutNotificationIds = perTeamRes.flatMap((res) => res.notificationIds)
  const activeMeetingIds = perTeamRes.flatMap((res) => res.activeMeetingIds)

  const organizationUsers = await pg
    .updateTable('OrganizationUser')
    .set({removedAt: sql`CURRENT_TIMESTAMP`})
    .where('userId', 'in', userIds)
    .where('orgId', '=', orgId)
    .where('removedAt', 'is', null)
    .returning(['id', 'role', 'userId'])
    .execute()
  if (organizationUsers.length === 0) {
    throw new Error('None of the users are members of the organization')
  }
  const removedUserIds = organizationUsers.map(({userId}) => userId)
  const users = (await dataLoader.get('users').loadMany(removedUserIds)).filter(isValid)
  await revalidateYjsConnections({userIds: removedUserIds})

  // Expire any pending invitations for these users across all teams in the org
  if (orgTeamIds.length > 0 && users.length > 0) {
    await pg
      .updateTable('TeamInvitation')
      .set({expiresAt: sql`CURRENT_TIMESTAMP`})
      .where(
        'email',
        'in',
        users.map(({email}) => email)
      )
      .where('teamId', 'in', orgTeamIds)
      .where('acceptedAt', 'is', null)
      .execute()
  }
  dataLoader.clearAll('organizationUsers')
  // need to make sure the org doc is updated before adjusting this
  const removedLeader = organizationUsers.find(
    ({role}) => role && ['BILLING_LEADER', 'ORG_ADMIN'].includes(role)
  )
  if (removedLeader) {
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
        dataLoader.clearAll('organizationUsers')
      } else if (organization.tier !== 'starter') {
        const user = await dataLoader.get('users').loadNonNull(removedLeader.userId)
        await resolveDowngradeToStarter(orgId, organization.stripeSubscriptionId!, user, dataLoader)
      }
    }
  }
  await reassignMeetingSeriesOwner(removedUserIds, orgId, orgTeamIds, dataLoader)
  await Promise.all(
    removedUserIds.map(async (userId) => {
      try {
        await adjustUserCount(userId, orgId, InvoiceItemType.REMOVE_USER, dataLoader)
      } catch (e) {
        Logger.log(e)
      }
    })
  )
  const removedUsers = await Promise.all(
    organizationUsers.map(async ({id, userId}) => ({
      userId,
      organizationUserId: id,
      tms: await dataLoader.get('teamIdsByUserId').load(userId)
    }))
  )
  return {
    removedUsers,
    taskIds,
    kickOutNotificationIds,
    teamIds,
    teamMemberIds,
    activeMeetingIds
  }
}

export default removeFromOrg
