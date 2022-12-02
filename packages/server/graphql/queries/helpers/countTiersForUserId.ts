import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import OrganizationUser from '../../../database/types/OrganizationUser'

// breaking this out into its own helper so it can be used directly to
// populate segment traits

const countTiersForUserId = async (userId: string) => {
  const r = await getRethink()
  const organizationUsers = (await r
    .table('OrganizationUser')
    .getAll(userId, {index: 'userId'})
    .filter({inactive: false, removedAt: null})
    .merge((organizationUser: RValue) => ({
      tier: r.table('Organization').get(organizationUser('orgId'))('tier').default('starter')
    }))
    .run()) as OrganizationUser[]
  const tierStarterCount = organizationUsers.filter(
    (organizationUser) => organizationUser.tier === 'starter'
  ).length
  const tierTeamCount = organizationUsers.filter(
    (organizationUser) => organizationUser.tier === 'team'
  ).length
  const tierEnterpriseCount = organizationUsers.filter(
    (organizationUser) => organizationUser.tier === 'enterprise'
  ).length
  const tierTeamBillingLeaderCount = organizationUsers.filter(
    (organizationUser) =>
      organizationUser.tier === 'team' && organizationUser.role === 'BILLING_LEADER'
  ).length
  return {
    tierStarterCount,
    tierTeamCount,
    tierEnterpriseCount,
    tierTeamBillingLeaderCount
  }
}

export default countTiersForUserId
