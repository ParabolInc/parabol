import {Threshold} from 'parabol-client/types/constEnums'
import {Team} from '../../../postgres/queries/getTeamsByIds'

const canAccessAISummary = (team: Team, featureFlags: string[]) => {
  if (featureFlags.includes('noAISummary') || !team) return false
  const {qualAIMeetingsCount, tier} = team
  if (tier !== 'starter') return true
  return qualAIMeetingsCount < Threshold.MAX_QUAL_AI_MEETINGS
}

export default canAccessAISummary
