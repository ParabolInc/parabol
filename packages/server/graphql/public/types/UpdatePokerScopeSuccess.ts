import getPhase from '../../../utils/getPhase'
import {augmentDBStage} from '../../resolvers'
import type {UpdatePokerScopeSuccessResolvers} from '../resolverTypes'

export type UpdatePokerScopeSuccessSource = {
  meetingId: string
  newStageIds: string[]
}

const UpdatePokerScopeSuccess: UpdatePokerScopeSuccessResolvers = {
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  },
  newStages: async ({meetingId, newStageIds}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const {phases, teamId} = meeting
    const phase = getPhase(phases, 'ESTIMATE')
    const {stages} = phase
    const dbNewStages = stages.filter((stage) => newStageIds.includes(stage.id))
    return dbNewStages.map((stage) => augmentDBStage(stage, meetingId, 'ESTIMATE', teamId))
  }
}

export default UpdatePokerScopeSuccess
