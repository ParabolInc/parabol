import {Threshold} from 'parabol-client/types/constEnums'
import {Team} from '../../../postgres/types'
import {DataLoaderWorker} from '../../graphql'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'

const canAccessAISummary = async (
  team: Team,
  featureFlags: string[],
  dataLoader: DataLoaderWorker,
  meetingType: 'standup' | 'retrospective'
) => {
  if (featureFlags.includes('noAISummary') || !team) return false
  const {qualAIMeetingsCount, orgId} = team
  const noAISummary = await dataLoader
    .get('featureFlagsByOwnerId')
    .load({ownerId: orgId, ownerType: 'Organization', featureName: 'noAISummary'})
  if (noAISummary) return false
  if (meetingType === 'standup') {
    const hasStandupFlag = await dataLoader
      .get('featureFlagsByOwnerId')
      .load({ownerId: orgId, ownerType: 'Organization', featureName: 'standupAISummary'})
    return hasStandupFlag
  }

  if (getFeatureTier(team) !== 'starter') return true
  return qualAIMeetingsCount < Threshold.MAX_QUAL_AI_MEETINGS
}

export default canAccessAISummary
