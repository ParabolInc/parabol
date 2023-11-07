import {Threshold} from 'parabol-client/types/constEnums'
import {Team} from '../../../postgres/queries/getTeamsByIds'
import {DataLoaderWorker} from '../../graphql'

const canAccessAISummary = async (
  team: Team,
  featureFlags: string[],
  dataLoader: DataLoaderWorker,
  meetingType: 'standup' | 'retrospective'
) => {
  if (featureFlags.includes('noAISummary') || !team) return false
  const {qualAIMeetingsCount, tier, trialStartDate, orgId} = team
  const organization = await dataLoader.get('organizations').load(orgId)
  if (organization.featureFlags?.includes('noAISummary')) return false
  if (meetingType === 'standup') {
    if (!organization.featureFlags?.includes('standupAISummary')) return false
    return true
  }

  if (tier !== 'starter' && !trialStartDate) return true
  return qualAIMeetingsCount < Threshold.MAX_QUAL_AI_MEETINGS
}

export default canAccessAISummary
