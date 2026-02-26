import type {RetrospectiveMeeting as RetrospectiveMeetingDB} from '../../../postgres/types/Meeting'
import isValid from '../../isValid'
import type {GroupPhaseCompletePayloadResolvers} from '../resolverTypes'

export type GroupPhaseCompletePayloadSource = {
  emptyReflectionGroupIds: string[]
  meeting: RetrospectiveMeetingDB
  reflectionGroupIds?: string[]
}

const GroupPhaseCompletePayload: GroupPhaseCompletePayloadResolvers = {
  reflectionGroups: async ({reflectionGroupIds}, _args, {dataLoader}) => {
    if (!reflectionGroupIds || reflectionGroupIds.length === 0) return []
    return (await dataLoader.get('retroReflectionGroups').loadMany(reflectionGroupIds)).filter(
      isValid
    )
  }
}

export default GroupPhaseCompletePayload
