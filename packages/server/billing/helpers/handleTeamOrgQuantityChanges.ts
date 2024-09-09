import {Organization} from '../../postgres/types'
import updateSubscriptionQuantity from './updateSubscriptionQuantity'

const handleTeamOrgQuantityChanges = async (paidOrgs: Organization[]) => {
  const teamOrgs = paidOrgs.filter((org) => org.tier === 'team')
  if (teamOrgs.length === 0) return

  await Promise.all(
    teamOrgs.map(async (org) => {
      await updateSubscriptionQuantity(org.id)
    })
  )
}

export default handleTeamOrgQuantityChanges
