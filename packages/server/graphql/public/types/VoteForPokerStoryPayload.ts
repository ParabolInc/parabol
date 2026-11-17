import {augmentDBStage} from '../../resolvers'
import type {VoteForPokerStoryPayloadResolvers} from '../resolverTypes'

export type VoteForPokerStoryPayloadSource = {
  meetingId: string
  stageId: string
}

const VoteForPokerStoryPayload: VoteForPokerStoryPayloadResolvers = {
  stage: async ({meetingId, stageId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const {phases, teamId} = meeting
    const phase = phases.find((phase) => phase.phaseType === 'ESTIMATE')!
    const dbStage = phase.stages.find((stage) => stage.id === stageId)!
    return augmentDBStage(dbStage, meetingId, 'ESTIMATE', teamId)
  }
}

export default VoteForPokerStoryPayload
