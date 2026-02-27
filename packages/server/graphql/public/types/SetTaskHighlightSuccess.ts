import type {SetTaskHighlightSuccessResolvers} from '../resolverTypes'

export type SetTaskHighlightSuccessSource = {
  meetingId: string
  taskId: string
}

const SetTaskHighlightSuccess: SetTaskHighlightSuccessResolvers = {
  task: ({taskId}, _args, {dataLoader}) => {
    return dataLoader.get('tasks').loadNonNull(taskId)
  }
}

export default SetTaskHighlightSuccess
