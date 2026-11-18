import findStageById from 'parabol-client/utils/meetings/findStageById'
import type {SetStageTimerPayloadResolvers} from '../resolverTypes'

export type SetStageTimerPayloadSource = {meetingId: string; stageId: string}

const SetStageTimerPayload: SetStageTimerPayloadResolvers = {
  stage: async (source, _args, {dataLoader}) => {
    const {meetingId, stageId} = source
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const stageRes = findStageById(meeting.phases, stageId)
    if (!stageRes) return null
    return {...stageRes.stage, meetingId, teamId: meeting.teamId}
  }
}

export default SetStageTimerPayload
