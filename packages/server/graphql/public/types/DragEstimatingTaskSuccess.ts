import getPhase from '../../../utils/getPhase'
import {augmentDBStage} from '../../resolvers'
import type {DragEstimatingTaskSuccessResolvers} from '../resolverTypes'

export type DragEstimatingTaskSuccessSource = {
  meetingId: string
  stageIds: string[]
}

const DragEstimatingTaskSuccess: DragEstimatingTaskSuccessResolvers = {
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  },
  stages: async ({meetingId, stageIds}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const {phases, teamId} = meeting
    const phase = getPhase(phases, 'ESTIMATE')
    const {stages} = phase
    const dbStages = stages.filter((stage) => stageIds.includes(stage.id))
    return dbStages.map((dbStage) => augmentDBStage(dbStage, meetingId, 'ESTIMATE', teamId))
  }
}

export default DragEstimatingTaskSuccess
