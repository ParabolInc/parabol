import {RecordSourceSelectorProxy} from 'relay-runtime'
import {handleRemoveReply} from '~/mutations/DeleteCommentMutation'
import getDiscussionThreadConn from '~/mutations/connections/getDiscussionThreadConn'
import {parseQueryParams} from '~/utils/useQueryParameterParser'
import IUser from '../../../server/database/types/User'
import {Task as ITask} from '../../../server/postgres/types/index.d'
import safeRemoveNodeFromArray from '../../utils/relay/safeRemoveNodeFromArray'
import safeRemoveNodeFromConn from '../../utils/relay/safeRemoveNodeFromConn'
import getArchivedTasksConn from '../connections/getArchivedTasksConn'
import getScopingTasksConn from '../connections/getScopingTasksConn'
import getTeamTasksConn from '../connections/getTeamTasksConn'
import getUserTasksConn from '../connections/getUserTasksConn'
import pluralizeHandler from './pluralizeHandler'

const handleRemoveTask = (taskId: string, store: RecordSourceSelectorProxy<any>) => {
  const viewer = store.getRoot().getLinkedRecord<IUser>('viewer')
  const task = store.get<ITask>(taskId)
  if (!task) return
  const teamId = task.getValue('teamId')
  const discussionId = task.getValue('discussionId')
  const threadParentId = task.getValue('threadParentId')
  if (threadParentId) {
    handleRemoveReply(taskId, threadParentId, store)
    return
  }
  const meetingId = task.getValue('meetingId')
  const meeting = store.get(meetingId!)!
  const team = store.get(teamId)
  const {userIds, teamIds} = parseQueryParams(viewer.getDataID(), window.location)
  const archiveConns = [
    /* archived task conn in user dash*/ getArchivedTasksConn(viewer, userIds, teamIds),
    /* archived task conn in team dash*/ getArchivedTasksConn(viewer, null, [teamId])
  ]
  const teamConn = getTeamTasksConn(team)
  const userConn = getUserTasksConn(viewer, userIds, teamIds)
  const threadConn = getDiscussionThreadConn(store, discussionId)
  safeRemoveNodeFromConn(taskId, teamConn)
  safeRemoveNodeFromConn(taskId, userConn)
  archiveConns.forEach((archiveConn) => safeRemoveNodeFromConn(taskId, archiveConn))
  safeRemoveNodeFromConn(taskId, threadConn)
  safeRemoveNodeFromArray(taskId, meeting, 'tasks')

  const scopingTasksConn = getScopingTasksConn(store, meetingId, viewer, [teamId])
  safeRemoveNodeFromConn(taskId, scopingTasksConn)
}

const handleRemoveTasks = pluralizeHandler(handleRemoveTask)
export default handleRemoveTasks
