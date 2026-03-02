import findStageById from 'parabol-client/utils/meetings/findStageById'
import type {RemoveReflectionPayloadResolvers} from '../resolverTypes'

export type RemoveReflectionPayloadSource =
  | {meetingId: string; reflectionId: string; unlockedStageIds?: string[]}
  | {error: {message: string}}

const RemoveReflectionPayload: RemoveReflectionPayloadResolvers = {
  meeting: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('newMeetings').loadNonNull(source.meetingId)
  },
  reflection: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('retroReflections').loadNonNull(source.reflectionId)
  },
  unlockedStages: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {meetingId, unlockedStageIds} = source
    if (!unlockedStageIds || unlockedStageIds.length === 0) return null
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    return unlockedStageIds.flatMap((stageId) => {
      const stageRes = findStageById(meeting.phases, stageId)
      if (!stageRes) return []
      return [{...stageRes.stage, meetingId, teamId: meeting.teamId}]
    })
  }
}

export default RemoveReflectionPayload
