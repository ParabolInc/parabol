import {InvoiceItemType} from 'parabol-client/types/constEnums'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
import getRethink from '../../../database/rethinkDriver'
import OrganizationUser from '../../../database/types/OrganizationUser'
import getTeamsByOrgIds from '../../../postgres/queries/getTeamsByOrgIds'
import {DataLoaderWorker} from '../../graphql'
import removeTeamMember from './removeTeamMember'
import resolveDowngradeToPersonal from './resolveDowngradeToPersonal'

const removeFromOrg = async (
  userId: string,
  orgId: string,
  evictorUserId: string | undefined,
  dataLoader: DataLoaderWorker
) => {
  const r = await getRethink()
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

  const [organizationUser, user] = await Promise.all([
    r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .filter({orgId, removedAt: null})
      .nth(0)
      .update(
        {removedAt: now},
        {returnChanges: true}
      )('changes')(0)('new_val')
      .default(null)
      .run() as unknown as OrganizationUser,
    dataLoader.get('users').load(userId)
  ])

  // need to make sure the org doc is updated before adjusting this
  const {joinedAt, newUserUntil, role} = organizationUser
  const prorationDate = newUserUntil >= now ? new Date(joinedAt) : undefined
  if (role === 'BILLING_LEADER') {
    const organization = await r.table('Organization').get(orgId).run()
    // if no other billing leader, promote the oldest
    // if pro tier & no other member, downgrade to personal
    const otherBillingLeaders = await r
      .table('OrganizationUser')
      .getAll(orgId, {index: 'orgId'})
      .filter({removedAt: null, role: 'BILLING_LEADER'})
      .run()
    if (otherBillingLeaders.length === 0) {
      const nextInLine = await r
        .table('OrganizationUser')
        .getAll(orgId, {index: 'orgId'})
        .filter({removedAt: null})
        .orderBy('joinedAt')
        .nth(0)
        .run()
      if (nextInLine) {
        await r
          .table('OrganizationUser')
          .get(nextInLine.id)
          .update({
            role: 'BILLING_LEADER'
          })
          .run()
      } else if (organization.tier !== 'personal') {
        await resolveDowngradeToPersonal(orgId, organization.stripeSubscriptionId!, userId)
      }
    }
  }
  try {
    await adjustUserCount(userId, orgId, InvoiceItemType.REMOVE_USER, {prorationDate})
  } catch (e) {
    console.log(e)
  }
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
