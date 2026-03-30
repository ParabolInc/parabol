import {getUserId} from '../../../utils/authorization'
import type {CreateTaskIntegrationPayloadResolvers} from '../resolverTypes'

export type CreateTaskIntegrationPayloadSource =
  | {
      taskId: string
    }
  | {error: {message: string}}

const CreateTaskIntegrationPayload: CreateTaskIntegrationPayloadResolvers = {
  task: async (source, _args, {authToken, dataLoader}) => {
    if ('error' in source) return null
    const taskDoc = await dataLoader.get('tasks').loadNonNull(source.taskId)
    const {userId, tags, teamId} = taskDoc
    const isViewer = userId === getUserId(authToken)
    const isViewerOnTeam = authToken.tms.includes(teamId)
    return isViewer || (!tags.includes('private') && isViewerOnTeam) ? taskDoc : null
  }
}

export default CreateTaskIntegrationPayload
