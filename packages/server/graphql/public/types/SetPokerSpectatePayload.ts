import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import type {EstimateStage as EstimateStageDB} from '../../../postgres/types/NewMeetingPhase'
import {augmentDBStage} from '../../resolvers'
import type {SetPokerSpectatePayloadResolvers} from '../resolverTypes'

export type SetPokerSpectatePayloadSource = {
  meetingId: string
  userId: string
  dirtyStages: EstimateStageDB[]
  teamId: string
}

const SetPokerSpectatePayload: SetPokerSpectatePayloadResolvers = {
  meetingMember: async ({userId, meetingId}, _args, {dataLoader}) => {
    const meetingMemberId = toTeamMemberId(meetingId, userId)
    return dataLoader.get('meetingMembers').loadNonNull(meetingMemberId)
  },
  updatedStages: ({dirtyStages, teamId, meetingId}) => {
    return dirtyStages.map((stage) => augmentDBStage(stage, meetingId, 'ESTIMATE', teamId))
  }
}

export default SetPokerSpectatePayload
