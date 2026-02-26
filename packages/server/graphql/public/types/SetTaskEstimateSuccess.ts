import {augmentDBStage} from '../../resolvers'
import type {SetTaskEstimateSuccessResolvers} from '../resolverTypes'

export type SetTaskEstimateSuccessSource = {
  meetingId: string
  stageId: string
  taskId: string
  exportCount: number
}

const SetTaskEstimateSuccess: SetTaskEstimateSuccessResolvers = {
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

export default SetTaskEstimateSuccess
