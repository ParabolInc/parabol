import {DataLoaderWorker} from '../../graphql'

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
  const {tier, isPaid, orgId, isArchived} = team

  if (!featureFlags.includes('meetingHistoryLimit')) {
    return false
  }

  if (tier !== 'personal' && isPaid) {
    return false
  }

  // Archived teams are not updated with the current tier, just check the organization
  if (isArchived) {
    const organization = await dataLoader.get('organizations').load(orgId)
    const {tier} = organization
    if (tier !== 'personal') {
      return false
    }
  }
  return true
}

export default isMeetingLocked
