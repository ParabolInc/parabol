import {Threshold} from 'parabol-client/types/constEnums'
import {Team} from '../../../postgres/queries/getTeamsByIds'
import {DataLoaderWorker} from '../../graphql'

// Returns whether AI summaries are allowed according to the user's + org's feature flags.
export const isAISummaryAllowed = async (
  team: Team,
  featureFlags: string[],
  dataLoader: DataLoaderWorker
) => {
  if (featureFlags.includes('noAISummary') || !team) return false
  const {orgId} = team
  const organization = await dataLoader.get('organizations').load(orgId)
  if (organization.featureFlags?.includes('noAISummary')) return false
  return true
}

const canAccessAISummary = async (
  team: Team,
  featureFlags: string[],
  dataLoader: DataLoaderWorker
) => {
  if (!isAISummaryAllowed(team, featureFlags, dataLoader)) return false
  const {qualAIMeetingsCount, tier} = team
  if (tier !== 'starter') return true
  return qualAIMeetingsCount < Threshold.MAX_QUAL_AI_MEETINGS
}

export default canAccessAISummary
