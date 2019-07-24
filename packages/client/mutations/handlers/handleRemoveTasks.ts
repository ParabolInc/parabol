import getArchivedTasksConn from '../connections/getArchivedTasksConn'
import getTeamTasksConn from '../connections/getTeamTasksConn'
import getUserTasksConn from '../connections/getUserTasksConn'
import pluralizeHandler from './pluralizeHandler'
import safeRemoveNodeFromConn from '../../utils/relay/safeRemoveNodeFromConn'
import safeRemoveNodeFromArray from '../../utils/relay/safeRemoveNodeFromArray'

const handleRemoveTask = (taskId, store, viewerId) => {
  const viewer = store.get(viewerId)
  const task = store.get(taskId)
  if (!task) return
  const teamId = task.getValue('teamId')
  const reflectionGroupId = task.getValue('reflectionGroupId')
  const reflectionGroup = store.get(reflectionGroupId)
  const meetingId = task.getValue('meetingId')
  const meeting = store.get(meetingId)
  const team = store.get(teamId)
  const archiveConn = getArchivedTasksConn(viewer, teamId)
  const teamConn = getTeamTasksConn(team)
  const userConn = getUserTasksConn(viewer)
  safeRemoveNodeFromConn(taskId, teamConn)
  safeRemoveNodeFromConn(taskId, userConn)
  safeRemoveNodeFromConn(taskId, archiveConn)
  safeRemoveNodeFromArray(taskId, reflectionGroup, 'tasks')
  safeRemoveNodeFromArray(taskId, meeting, 'tasks')
}

const handleRemoveTasks = pluralizeHandler(handleRemoveTask)
export default handleRemoveTasks
