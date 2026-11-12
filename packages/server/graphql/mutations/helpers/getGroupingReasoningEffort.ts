import type {GroupingReasoningEffort} from '../../../utils/groupReflections/types'
import type {DataLoaderWorker} from '../../graphql'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'

const getGroupingReasoningEffort = async (
  teamId: string,
  dataLoader: DataLoaderWorker
): Promise<GroupingReasoningEffort> => {
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const org = await dataLoader.get('organizations').loadNonNull(team.orgId)
  return getFeatureTier(org) === 'starter' ? 'low' : 'medium'
}

export default getGroupingReasoningEffort
