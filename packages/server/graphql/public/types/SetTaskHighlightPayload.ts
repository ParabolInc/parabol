import type {SetTaskHighlightPayloadResolvers} from '../resolverTypes'

export type SetTaskHighlightPayloadSource = {
  meetingId: string
  taskId: string
}

const SetTaskHighlightPayload: SetTaskHighlightPayloadResolvers = {
  task: ({taskId}, _args, {dataLoader}) => {
    return dataLoader.get('tasks').loadNonNull(taskId)
  }
}

export default SetTaskHighlightPayload
