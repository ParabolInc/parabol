import {Threshold} from 'parabol-client/types/constEnums'
import {Team} from '../../../postgres/types'
import {DataLoaderWorker} from '../../graphql'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'

const canAccessAISummary = async (
  team: Team,
  userId: string,
  meetingType: 'standup' | 'retrospective',
  dataLoader: DataLoaderWorker
) => {
  const {qualAIMeetingsCount, orgId} = team
  const [noAIOrgSummary, noAIUserSummary] = await Promise.all([
    dataLoader
      .get('featureFlagByOwnerId')
      .load({ownerId: orgId, scope: 'Organization', featureName: 'noAISummary'}),
    dataLoader
      .get('featureFlagByOwnerId')
      .load({ownerId: userId, scope: 'User', featureName: 'noAISummary'})
  ])

  if (noAIOrgSummary || noAIUserSummary) return false
  if (meetingType === 'standup') {
    const hasStandupFlag = await dataLoader
      .get('featureFlagByOwnerId')
      .load({ownerId: orgId, scope: 'Organization', featureName: 'standupAISummary'})
    return hasStandupFlag
  }

  if (getFeatureTier(team) !== 'starter') return true
  return qualAIMeetingsCount < Threshold.MAX_QUAL_AI_MEETINGS
}

export default canAccessAISummary
