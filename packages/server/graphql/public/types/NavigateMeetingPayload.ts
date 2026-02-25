import findStageById from 'parabol-client/utils/meetings/findStageById'
import type {NavigateMeetingPayloadResolvers} from '../resolverTypes'

export type NavigateMeetingPayloadSource =
  | {
      meetingId: string
      oldFacilitatorStageId: string
      facilitatorStageId: string | null | undefined
      unlockedStageIds: string[] | undefined
      reflect?: unknown
      group?: unknown
      vote?: unknown
    }
  | {error: {message: string}}

const NavigateMeetingPayload: NavigateMeetingPayloadResolvers = {
  meeting: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return (await dataLoader.get('newMeetings').load(source.meetingId)) ?? null
  },
  facilitatorStage: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {meetingId, facilitatorStageId} = source
    if (!facilitatorStageId) return null
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const stageRes = findStageById(meeting.phases, facilitatorStageId)
    if (!stageRes) return null
    return {...stageRes.stage, meetingId, teamId: meeting.teamId}
  },
  oldFacilitatorStage: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {meetingId, oldFacilitatorStageId} = source
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const stageRes = findStageById(meeting.phases, oldFacilitatorStageId)
    if (!stageRes) return null
    return {...stageRes.stage, meetingId, teamId: meeting.teamId}
  },
  phaseComplete: (source) => {
    if ('error' in source) return null
    return source as any
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

export default NavigateMeetingPayload
