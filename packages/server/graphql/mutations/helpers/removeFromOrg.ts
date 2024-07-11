import {sql} from 'kysely'
import {InvoiceItemType} from 'parabol-client/types/constEnums'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
import getRethink from '../../../database/rethinkDriver'
import OrganizationUser from '../../../database/types/OrganizationUser'
import getKysely from '../../../postgres/getKysely'
import getTeamsByOrgIds from '../../../postgres/queries/getTeamsByOrgIds'
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
  const r = await getRethink()
  const pg = getKysely()
  const now = new Date()
  const orgTeams = await getTeamsByOrgIds([orgId])
  const teamIds = orgTeams.map((team) => team.id)
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
    res.notificationId && arr.push(res.notificationId)
    return arr
  }, [])

  const [_pgOrgUser, organizationUser, user] = await Promise.all([
    pg
      .updateTable('OrganizationUser')
      .set({removedAt: sql`CURRENT_TIMESTAMP`})
      .where('userId', '=', userId)
      .where('orgId', '=', orgId)
      .where('removedAt', 'is', null)
      .returning('role')
      .executeTakeFirstOrThrow(),
    r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .filter({orgId, removedAt: null})
      .nth(0)
      .update({removedAt: now}, {returnChanges: true})('changes')(0)('new_val')
      .default(null)
      .run() as unknown as OrganizationUser,
    dataLoader.get('users').loadNonNull(userId)
  ])

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
        await r
          .table('OrganizationUser')
          .get(nextInLine.id)
          .update({
            role: 'BILLING_LEADER'
          })
          .run()
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
    organizationUserId: organizationUser.id
  }
}

export default removeFromOrg
