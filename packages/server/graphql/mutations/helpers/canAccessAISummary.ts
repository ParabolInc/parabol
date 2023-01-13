import {Threshold} from 'parabol-client/types/constEnums'
import {Team} from '../../../postgres/queries/getTeamsByIds'

const canAccessAISummary = (team: Team | undefined, featureFlags: string[]) => {
  if (!featureFlags.includes('aiSummary') || !team) return false
  const {qualAIMeetingsCount, tier} = team
  if (tier !== 'starter') return true
  return qualAIMeetingsCount < Threshold.MAX_QUAL_AI_MEETINGS
}

export default canAccessAISummary
