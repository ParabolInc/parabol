import findStageById from 'parabol-client/utils/meetings/findStageById'
import type {PokerMeeting} from '../../../postgres/types/Meeting'
import type {EstimatePhase} from '../../../postgres/types/NewMeetingPhase'
import type {PokerRevealVotesSuccessResolvers} from '../resolverTypes'

export type PokerRevealVotesSuccessSource = {
  meetingId: string
  stageId: string
}

const PokerRevealVotesSuccess: PokerRevealVotesSuccessResolvers = {
  stage: async ({meetingId, stageId}, _args, {dataLoader}) => {
    const meeting = (await dataLoader.get('newMeetings').loadNonNull(meetingId)) as PokerMeeting
    const stageRes = findStageById<EstimatePhase>(meeting.phases as any, stageId)
    if (!stageRes) throw new Error('Stage not found')
    return {...stageRes.stage, meetingId, teamId: meeting.teamId}
  }
}

export default PokerRevealVotesSuccess
