import type {DataLoaderWorker} from '../../graphql'
import {getFeatureTier} from './getFeatureTier'

/*
 * Meetings can be locked if:
 * - the meeting enden more than 30 days ago on the starter tier
 * - the organization is unpaid
 */
const isMeetingLocked = async (
  teamId: string,
  endedAt: Date | undefined | null,
  dataLoader: DataLoaderWorker
) => {
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const {orgId} = team
  const org = await dataLoader.get('organizations').loadNonNull(orgId)
  const featureTier = getFeatureTier(org)
  const {isPaid} = org

  if (!isPaid) {
    return true
  }
  if (featureTier !== 'starter') {
    return false
  }

  const freeLimit = new Date()
  freeLimit.setDate(freeLimit.getDate() - 30)
  if (!endedAt || endedAt > freeLimit) {
    return false
  }

  return true
}

export default isMeetingLocked
