import type {UpdateReflectionGroupTitlePayloadResolvers} from '../resolverTypes'

export type UpdateReflectionGroupTitlePayloadSource = {meetingId: string; reflectionGroupId: string}

const UpdateReflectionGroupTitlePayload: UpdateReflectionGroupTitlePayloadResolvers = {
  meeting: (source, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(source.meetingId)
  },
  reflectionGroup: async (source, _args, {dataLoader}) => {
    return (await dataLoader.get('retroReflectionGroups').load(source.reflectionGroupId)) ?? null
  }
}

export default UpdateReflectionGroupTitlePayload
