import {getUserId} from '../../../utils/authorization'
import type {ChangeTaskTeamPayloadResolvers} from '../resolverTypes'

export type ChangeTaskTeamPayloadSource = {
  taskId: string
}

const ChangeTaskTeamPayload: ChangeTaskTeamPayloadResolvers = {
  task: async (source, _args, {authToken, dataLoader}) => {
    const {taskId} = source
    const task = await dataLoader.get('tasks').load(taskId)
    if (!task) return null
    const {userId, tags, teamId} = task
    const isViewer = userId === getUserId(authToken)
    const isViewerOnTeam = authToken.tms.includes(teamId)
    return isViewer || (!tags.includes('private') && isViewerOnTeam) ? task : null
  },
  removedTaskId: ({taskId}) => taskId
}

export default ChangeTaskTeamPayload
