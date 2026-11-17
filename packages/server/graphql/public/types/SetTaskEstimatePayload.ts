import {augmentDBStage} from '../../resolvers'
import type {SetTaskEstimatePayloadResolvers} from '../resolverTypes'

export type SetTaskEstimatePayloadSource = {
  meetingId: string
  stageId: string
  taskId: string
  exportCount: number
}

const SetTaskEstimatePayload: SetTaskEstimatePayloadResolvers = {
  task: ({taskId}, _args, {dataLoader}) => {
    return dataLoader.get('tasks').loadNonNull(taskId)
  },
  stage: async ({meetingId, stageId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const {phases, teamId} = meeting
    const phase = phases.find((phase) => phase.phaseType === 'ESTIMATE')
    if (!phase) return null
    const dbStage = phase.stages.find((stage) => stage.id === stageId)
    if (!dbStage) return null
    return augmentDBStage(dbStage, meetingId, 'ESTIMATE', teamId)
  },
  exportCount: ({exportCount}) => exportCount ?? 0
}

export default SetTaskEstimatePayload
