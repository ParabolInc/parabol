import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import type {EstimateStage as EstimateStageDB} from '../../../postgres/types/NewMeetingPhase'
import {augmentDBStage} from '../../resolvers'
import type {SetPokerSpectateSuccessResolvers} from '../resolverTypes'

export type SetPokerSpectateSuccessSource = {
  meetingId: string
  userId: string
  dirtyStages: EstimateStageDB[]
  teamId: string
}

const SetPokerSpectateSuccess: SetPokerSpectateSuccessResolvers = {
  meetingMember: async ({userId, meetingId}, _args, {dataLoader}) => {
    const meetingMemberId = toTeamMemberId(meetingId, userId)
    return dataLoader.get('meetingMembers').loadNonNull(meetingMemberId)
  },
  updatedStages: ({dirtyStages, teamId, meetingId}) => {
    return dirtyStages.map((stage) => augmentDBStage(stage, meetingId, 'ESTIMATE', teamId))
  }
}

export default SetPokerSpectateSuccess
