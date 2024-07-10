import {DataLoaderWorker} from '../../graphql'
import {getFeatureTier} from './getFeatureTier'

const isMeetingLocked = async (
  viewerId: string,
  teamId: string,
  endedAt: Date | undefined | null,
  dataLoader: DataLoaderWorker
) => {
  const freeLimit = new Date()
  freeLimit.setDate(freeLimit.getDate() - 30)
  if (!endedAt || endedAt > freeLimit) {
    return false
  }
  const [team, viewer] = await Promise.all([
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])

  const {featureFlags} = viewer
  const {tier, trialStartDate, isPaid, orgId, isArchived} = team

  if (featureFlags.includes('noMeetingHistoryLimit')) {
    return false
  }

  if ((tier !== 'starter' && isPaid) || trialStartDate) {
    return false
  }

  // Archived teams are not updated with the current tier, just check the organization
  if (isArchived) {
    const organization = await dataLoader.get('organizations').loadNonNull(orgId)
    if (getFeatureTier(organization) !== 'starter') {
      return false
    }
  }
  return true
}

export default isMeetingLocked
