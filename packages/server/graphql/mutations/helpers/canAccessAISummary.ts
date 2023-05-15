import {Threshold} from 'parabol-client/types/constEnums'
import {Team} from '../../../postgres/queries/getTeamsByIds'
import {DataLoaderWorker} from '../../graphql'

const canAccessAISummary = async (
  team: Team,
  featureFlags: string[],
  dataLoader: DataLoaderWorker
) => {
  if (featureFlags.includes('noAISummary') || !team) return false
  const {qualAIMeetingsCount, tier, orgId} = team
  const organization = await dataLoader.get('organizations').load(orgId)
  if (organization.featureFlags?.includes('noAISummary')) return false
  if (tier !== 'starter') return true
  return qualAIMeetingsCount < Threshold.MAX_QUAL_AI_MEETINGS
}

export default canAccessAISummary
