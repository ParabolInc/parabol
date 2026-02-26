import findStageById from 'parabol-client/utils/meetings/findStageById'
import type {FlagReadyToAdvanceSuccessResolvers} from '../resolverTypes'

export type FlagReadyToAdvanceSuccessSource = {
  meetingId: string
  stageId: string
}

const FlagReadyToAdvanceSuccess: FlagReadyToAdvanceSuccessResolvers = {
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  },
  stage: async ({meetingId, stageId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const stageRes = findStageById(meeting.phases, stageId)
    if (!stageRes) throw new Error('Stage not found')
    return {
      ...stageRes.stage,
      meetingId,
      teamId: meeting.teamId
    }
  }
}

export default FlagReadyToAdvanceSuccess
