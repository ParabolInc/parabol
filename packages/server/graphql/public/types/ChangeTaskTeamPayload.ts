import {getUserId, isTeamMemberAsync} from '../../../utils/authorization'
import type {ChangeTaskTeamPayloadResolvers} from '../resolverTypes'

export type ChangeTaskTeamPayloadSource =
  | {
      taskId: string
    }
  | {error: {message: string}}

const ChangeTaskTeamPayload: ChangeTaskTeamPayloadResolvers = {
  task: async (source, _args, {authToken, dataLoader}) => {
    if ('error' in source) return null
    const {taskId} = source
    const task = await dataLoader.get('tasks').load(taskId)
    if (!task) return null
    const {userId, tags, teamId} = task
    const viewerId = getUserId(authToken)
    const isViewer = userId === viewerId
    const isViewerOnTeam = await isTeamMemberAsync(viewerId, teamId, dataLoader)
    return isViewer || (!tags.includes('private') && isViewerOnTeam) ? task : null
  },
  removedTaskId: (source) => ('error' in source ? null : source.taskId)
}

export default ChangeTaskTeamPayload
