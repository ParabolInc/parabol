import getRethink from '../../../database/rethinkDriver'
import {OrgUserRole, TierEnum} from 'parabol-client/types/graphql'

// breaking this out into its own helper so it can be used directly to
// populate segment traits

const countTiersForUserId = async (userId) => {
  const r = await getRethink()
  const organizationUsers = await r
    .table('OrganizationUser')
    .getAll(userId, {index: 'userId'})
    .filter({inactive: false, removedAt: null})
    .merge((organizationUser) => ({
      tier: r
        .table('Organization')
        .get(organizationUser('orgId'))('tier')
        .default(TierEnum.personal)
    }))
    .run()
  const tierPersonalCount = organizationUsers.filter(
    (organizationUser) => organizationUser.tier === TierEnum.personal
  ).length
  const tierProCount = organizationUsers.filter(
    (organizationUser) => organizationUser.tier === TierEnum.pro
  ).length
  const tierEnterpriseCount = organizationUsers.filter(
    (organizationUser) => organizationUser.tier === TierEnum.enterprise
  ).length
  const tierProBillingLeaderCount = organizationUsers.filter(
    (organizationUser) =>
      organizationUser.tier === TierEnum.pro && organizationUser.role === OrgUserRole.BILLING_LEADER
  ).length
  return {
    tierPersonalCount,
    tierProCount,
    tierEnterpriseCount,
    tierProBillingLeaderCount
  }
}

export default countTiersForUserId
