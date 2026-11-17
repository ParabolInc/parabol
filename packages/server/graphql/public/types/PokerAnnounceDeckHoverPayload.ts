import findStageById from 'parabol-client/utils/meetings/findStageById'
import type {PokerMeeting} from '../../../postgres/types/Meeting'
import type {EstimatePhase} from '../../../postgres/types/NewMeetingPhase'
import type {PokerAnnounceDeckHoverPayloadResolvers} from '../resolverTypes'

export type PokerAnnounceDeckHoverPayloadSource = {
  meetingId: string
  stageId: string
  userId: string
  isHover: boolean
}

const PokerAnnounceDeckHoverPayload: PokerAnnounceDeckHoverPayloadResolvers = {
  user: ({userId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(userId)
  },
  stage: async ({meetingId, stageId}, _args, {dataLoader}) => {
    const meeting = (await dataLoader.get('newMeetings').loadNonNull(meetingId)) as PokerMeeting
    const stageRes = findStageById<EstimatePhase>(meeting.phases as any, stageId)
    if (!stageRes) throw new Error('Stage not found')
    return {...stageRes.stage, meetingId, teamId: meeting.teamId}
  }
}

export default PokerAnnounceDeckHoverPayload
