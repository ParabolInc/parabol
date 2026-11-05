import type {DataLoaderInstance} from '../dataloader/RootDataLoader'
import removeAllUsersFromOrg from '../graphql/mutations/helpers/removeAllUsersFromOrg'

// Only does something if the organization is empty & not paid
// safeArchiveTeam & downgradeToStarter should be called before calling this

const safeArchiveEmptyStarterOrganization = async (
  orgId: string,
  dataLoader: DataLoaderInstance
) => {
  const orgTeams = await dataLoader.get('teamsByOrgIds').load(orgId)
  const teamCountRemainingOnOldOrg = orgTeams.length

  if (teamCountRemainingOnOldOrg > 0) return
  const org = await dataLoader.get('organizations').loadNonNull(orgId)
  if (org.tier !== 'starter') return
  await removeAllUsersFromOrg(orgId)
  dataLoader.clearAll('organizationUsers')
}

export default safeArchiveEmptyStarterOrganization
