import getPhase from '../../../utils/getPhase'
import {augmentDBStage} from '../../resolvers'
import type {DragDiscussionTopicPayloadResolvers} from '../resolverTypes'

export type DragDiscussionTopicPayloadSource = {meetingId: string; stageId: string}

const DragDiscussionTopicPayload: DragDiscussionTopicPayloadResolvers = {
  meeting: (source, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(source.meetingId)
  },
  stage: async (source, _args, {dataLoader}) => {
    const {meetingId, stageId} = source
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const {phases, teamId} = meeting
    const phase = getPhase(phases, 'discuss')
    const dbStage = phase.stages.find((s) => s.id === stageId)!
    return augmentDBStage(dbStage, meetingId, 'discuss', teamId)
  }
}

export default DragDiscussionTopicPayload
