import {DataLoaderInstance} from '../../../dataloader/RootDataLoader'
import isValid from '../../isValid'

// breaking this out into its own helper so it can be used directly to
// populate segment traits

const countTiersForUserId = async (userId: string, dataLoader: DataLoaderInstance) => {
  const allOrgUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
  const organizationUsers = allOrgUsers.filter(({inactive}) => !inactive)
  const activeOrgs = (await dataLoader.get('organizations').loadMany(organizationUsers.map(({orgId}) => orgId))).filter(isValid)
  const tierStarterCount = activeOrgs.filter(
    ({tier}) => tier === 'starter'
  ).length
  const tierTeamCount = activeOrgs.filter(
    ({tier}) => tier === 'team'
  ).length
  const tierEnterpriseCount = activeOrgs.filter(
    ({tier}) => tier === 'enterprise'
  ).length
  const tierTeamBillingLeaderCount = organizationUsers.filter(
    (organizationUser) => activeOrgs.find(({id}) => id === organizationUser.orgId)?.tier === 'team' && organizationUser.role === 'BILLING_LEADER').length
  return {
    tierStarterCount,
    tierTeamCount,
    tierEnterpriseCount,
    tierTeamBillingLeaderCount
  }
}

export default countTiersForUserId
