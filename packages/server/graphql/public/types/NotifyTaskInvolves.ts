import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import {NotifyTaskInvolvesResolvers} from '../resolverTypes'

const NotifyTaskInvolves: NotifyTaskInvolvesResolvers = {
  __isTypeOf: ({type}) => type === 'TASK_INVOLVES',
  task: async ({taskId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const task = await dataLoader.get('tasks').load(taskId)
    if (!task) return null
    const {tags, teamId, userId} = task
    if (!isTeamMember(authToken, teamId)) return null
    if (isTaskPrivate(tags) && viewerId !== userId) return null
    return task
  },

  changeAuthor: ({changeAuthorId}, _args, {dataLoader}) => {
    return dataLoader.get('teamMembers').load(changeAuthorId)
  },

  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default NotifyTaskInvolves
