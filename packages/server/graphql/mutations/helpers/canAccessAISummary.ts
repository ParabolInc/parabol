import {Threshold} from 'parabol-client/types/constEnums'
import {DataLoaderWorker} from '../../graphql'
import {TeamSource} from '../../public/types/Team'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'

const canAccessAISummary = async (
  team: TeamSource,
  featureFlags: string[],
  dataLoader: DataLoaderWorker,
  meetingType: 'standup' | 'retrospective'
) => {
  if (featureFlags.includes('noAISummary') || !team) return false
  const {qualAIMeetingsCount, orgId} = team
  const organization = await dataLoader.get('organizations').loadNonNull(orgId)
  if (organization.featureFlags?.includes('noAISummary')) return false
  if (meetingType === 'standup') {
    if (!organization.featureFlags?.includes('standupAISummary')) return false
    return true
  }

  if (getFeatureTier(team) !== 'starter') return true
  return qualAIMeetingsCount < Threshold.MAX_QUAL_AI_MEETINGS
}

export default canAccessAISummary
