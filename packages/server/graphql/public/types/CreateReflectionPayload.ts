import {resolveUnlockedStages} from '../../resolvers'
import type {CreateReflectionPayloadResolvers} from '../resolverTypes'

export type CreateReflectionPayloadSource =
  | {
      meetingId: string
      reflectionId: string
      reflectionGroupId: string
      unlockedStageIds?: string[]
    }
  | {error: {message: string}}

const CreateReflectionPayload: CreateReflectionPayloadResolvers = {
  meeting: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('newMeetings').loadNonNull(source.meetingId)
  },
  reflection: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('retroReflections').loadNonNull(source.reflectionId)
  },
  reflectionGroup: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('retroReflectionGroups').loadNonNull(source.reflectionGroupId)
  },
  unlockedStages: async (source, args, context) => {
    if ('error' in source || !source.unlockedStageIds) return null
    const stages = await resolveUnlockedStages(
      {meetingId: source.meetingId, unlockedStageIds: source.unlockedStageIds},
      args,
      context
    )
    return stages || null
  }
}

export default CreateReflectionPayload
