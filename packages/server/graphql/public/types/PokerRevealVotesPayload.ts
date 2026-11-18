import {GraphQLError} from 'graphql'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import type {PokerMeeting} from '../../../postgres/types/Meeting'
import type {EstimatePhase} from '../../../postgres/types/NewMeetingPhase'
import type {PokerRevealVotesPayloadResolvers} from '../resolverTypes'

export type PokerRevealVotesPayloadSource = {
  meetingId: string
  stageId: string
}

const PokerRevealVotesPayload: PokerRevealVotesPayloadResolvers = {
  stage: async ({meetingId, stageId}, _args, {dataLoader}) => {
    const meeting = (await dataLoader.get('newMeetings').loadNonNull(meetingId)) as PokerMeeting
    const stageRes = findStageById<EstimatePhase>(meeting.phases as any, stageId)
    if (!stageRes)
      throw new GraphQLError('Stage not found', {extensions: {code: 'INTERNAL_SERVER_ERROR'}})
    return {...stageRes.stage, meetingId, teamId: meeting.teamId}
  }
}

export default PokerRevealVotesPayload
