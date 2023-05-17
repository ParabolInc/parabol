import Organization from '../../database/types/Organization'
import {DataLoaderWorker} from '../../graphql/graphql'
import updateSubscriptionQuantity from './updateSubscriptionQuantity'

const handleTeamOrgQuantityChanges = async (
  paidOrgs: Organization[],
  dataLoader: DataLoaderWorker
) => {
  const teamOrgs = paidOrgs.filter((org) => org.tier === 'team')
  if (teamOrgs.length === 0) return

  await Promise.all(
    teamOrgs.map(async (org) => {
      await updateSubscriptionQuantity(org.id, dataLoader)
    })
  )
}

export default handleTeamOrgQuantityChanges
