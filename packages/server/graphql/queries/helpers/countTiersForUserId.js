import getRethink from '../../../database/rethinkDriver'
import {BILLING_LEADER, PERSONAL, PRO, ENTERPRISE} from '../../../../client/utils/constants'

// breaking this out into its own helper so it can be used directly to
// populate segment traits

const countTiersForUserId = async (userId) => {
  const r = getRethink()
  const organizationUsers = await r
    .table('OrganizationUser')
    .getAll(userId, {index: 'userId'})
    .filter({inactive: false, removedAt: null})
    .merge((organizationUser) => ({
      tier: r
        .table('Organization')
        .get(organizationUser('orgId'))('tier')
        .default(PERSONAL)
    }))
  const tierPersonalCount = organizationUsers.filter(
    (organizationUser) => organizationUser.tier === PERSONAL
  ).length
  const tierProCount = organizationUsers.filter((organizationUser) => organizationUser.tier === PRO)
    .length
  const tierEnterpriseCount = organizationUsers.filter(
    (organizationUser) => organizationUser.tier === ENTERPRISE
  ).length
  const tierProBillingLeaderCount = organizationUsers.filter(
    (organizationUser) => organizationUser.tier === PRO && organizationUser.role === BILLING_LEADER
  ).length
  return {
    tierPersonalCount,
    tierProCount,
    tierEnterpriseCount,
    tierProBillingLeaderCount
  }
}

export default countTiersForUserId
