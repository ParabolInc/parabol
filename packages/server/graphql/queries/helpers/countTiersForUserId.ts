import {DataLoaderInstance} from '../../../dataloader/RootDataLoader'

// breaking this out into its own helper so it can be used directly to
// populate segment traits

const countTiersForUserId = async (userId: string, dataLoader: DataLoaderInstance) => {
  const allOrgUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
  const organizationUsers = allOrgUsers.filter(({inactive}) => !inactive)
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
