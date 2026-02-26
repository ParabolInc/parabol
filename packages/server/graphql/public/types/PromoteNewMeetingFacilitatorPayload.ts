import findStageById from 'parabol-client/utils/meetings/findStageById'
import type {PromoteNewMeetingFacilitatorPayloadResolvers} from '../resolverTypes'

export type PromoteNewMeetingFacilitatorPayloadSource =
  | {meetingId: string; oldFacilitatorUserId: string | null}
  | {error: {message: string}}

const PromoteNewMeetingFacilitatorPayload: PromoteNewMeetingFacilitatorPayloadResolvers = {
  meeting: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return (await dataLoader.get('newMeetings').load(source.meetingId)) ?? null
  },
  facilitatorStage: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const meeting = await dataLoader.get('newMeetings').load(source.meetingId)
    if (!meeting) return null
    const {facilitatorStageId, phases, id: meetingId, teamId} = meeting
    if (!facilitatorStageId) return null
    const stageRes = findStageById(phases, facilitatorStageId)
    if (!stageRes) return null
    return {...stageRes.stage, meetingId, teamId}
  },
  oldFacilitator: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    if (!source.oldFacilitatorUserId) return null
    return (await dataLoader.get('users').load(source.oldFacilitatorUserId)) ?? null
  }
}

export default PromoteNewMeetingFacilitatorPayload
