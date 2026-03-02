import type {UpdateReflectionGroupTitlePayloadResolvers} from '../resolverTypes'

export type UpdateReflectionGroupTitlePayloadSource =
  | {meetingId: string; reflectionGroupId: string}
  | {error: {message: string}}

const UpdateReflectionGroupTitlePayload: UpdateReflectionGroupTitlePayloadResolvers = {
  meeting: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('newMeetings').loadNonNull(source.meetingId)
  },
  reflectionGroup: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return (await dataLoader.get('retroReflectionGroups').load(source.reflectionGroupId)) ?? null
  }
}

export default UpdateReflectionGroupTitlePayload
