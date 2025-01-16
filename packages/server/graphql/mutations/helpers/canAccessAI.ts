import {Threshold} from 'parabol-client/types/constEnums'
import {Team} from '../../../postgres/types'
import {DataLoaderWorker} from '../../graphql'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'

const canAccessAI = async (team: Team, dataLoader: DataLoaderWorker) => {
  const {qualAIMeetingsCount, orgId} = team
  const org = await dataLoader.get('organizations').loadNonNull(orgId)

  if (!org.useAI) return false

  if (getFeatureTier(team) !== 'starter') return true
  return qualAIMeetingsCount < Threshold.MAX_QUAL_AI_MEETINGS
}

export default canAccessAI
