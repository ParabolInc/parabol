import type {UpdateReflectionContentPayloadResolvers} from '../resolverTypes'

export type UpdateReflectionContentPayloadSource =
  | {meetingId: string; reflectionId: string}
  | {error: {message: string}}

const UpdateReflectionContentPayload: UpdateReflectionContentPayloadResolvers = {
  meeting: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('newMeetings').loadNonNull(source.meetingId)
  },
  reflection: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return (await dataLoader.get('retroReflections').load(source.reflectionId)) ?? null
  }
}

export default UpdateReflectionContentPayload
