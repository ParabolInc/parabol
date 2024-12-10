import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import getDiscussionThreadConn from '~/mutations/connections/getDiscussionThreadConn'
import isTaskPrivate from '~/utils/isTaskPrivate'
import {parseQueryParams} from '~/utils/useQueryParameterParser'
import addNodeToArray from '../../utils/relay/addNodeToArray'
import safeRemoveNodeFromConn from '../../utils/relay/safeRemoveNodeFromConn'
import safeRemoveNodeFromUnknownConn from '../../utils/relay/safeRemoveNodeFromUnknownConn'
import getArchivedTasksConn from '../connections/getArchivedTasksConn'
import getScopingTasksConn from '../connections/getScopingTasksConn'
import getTeamTasksConn from '../connections/getTeamTasksConn'
import getUserTasksConn from '../connections/getUserTasksConn'
import pluralizeHandler from './pluralizeHandler'
import safePutNodeInConn from './safePutNodeInConn'

type Task = RecordProxy<{
  readonly id: string
  readonly teamId: string
  readonly tags: readonly string[]
  readonly discussionId: string | null | undefined
  readonly threadParentId: string | null | undefined
  readonly meetingId: string | null | undefined
  readonly updatedAt: string | null | undefined
  readonly userId: string | null | undefined
}>

const handleUpsertTask = (task: Task | null, store: RecordSourceSelectorProxy<any>) => {
  if (!task) return
  // we currently have 4 connections: user, team, team archive, scoping
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!viewer) return
  const viewerId = viewer.getDataID()
  const teamId = task.getValue('teamId')
  const taskId = task.getValue('id')
  const tags = task.getValue('tags')
  const threadParentId = task.getValue('threadParentId')
  if (threadParentId) {
    addNodeToArray(task, store.get(threadParentId), 'replies', 'threadSortOrder')
    return
  }
  const meetingId = task.getValue('meetingId')
  const isNowArchived = tags.includes('archived')
  const {userIds, teamIds} = parseQueryParams(viewerId, window.location)
  const archiveConns = [
    /* archived task conn in user dash*/ getArchivedTasksConn(viewer, userIds, teamIds),
    /* archived task conn in team dash*/ getArchivedTasksConn(viewer, null, [teamId])
  ]
  const team = store.get(teamId)
  const teamConn = getTeamTasksConn(team)
  const userConn = getUserTasksConn(viewer, userIds, teamIds)
  const discussionId = task.getValue('discussionId')
  const threadConn = getDiscussionThreadConn(store, discussionId)
  const meeting = meetingId ? store.get(meetingId) : null

  if (isNowArchived) {
    safeRemoveNodeFromConn(taskId, teamConn)
    safeRemoveNodeFromConn(taskId, userConn)
    safeRemoveNodeFromUnknownConn(store, viewerId, 'ParabolScopingSearchResults_tasks', taskId)
    archiveConns.forEach((archiveConn) => safePutNodeInConn(archiveConn, task, store))
  } else {
    archiveConns.forEach((archiveConn) => safeRemoveNodeFromConn(taskId, archiveConn))
    safePutNodeInConn(teamConn, task, store)
    safePutNodeInConn(threadConn, task, store, 'threadSortOrder', true)
    addNodeToArray(task, meeting, 'tasks', 'createdAt')
    /* updates parabol search query if task is created from a sprint poker meeting
     * should also implement updating parabol search query if task is created elsewhere?
     */
    const scopingTasksConn = getScopingTasksConn(store, meetingId, viewer, [teamId])
    safePutNodeInConn(scopingTasksConn, task, store, 'updatedAt', false)
    if (userConn) {
      const isPrivate = isTaskPrivate(tags)
      const ownedByViewer = task.getValue('userId') === viewerId
      if (isPrivate && !ownedByViewer) {
        safeRemoveNodeFromConn(taskId, userConn)
      } else {
        safePutNodeInConn(userConn, task, store)
      }
    }
  }
}

const handleUpsertTasks = pluralizeHandler(handleUpsertTask)
export default handleUpsertTasks
