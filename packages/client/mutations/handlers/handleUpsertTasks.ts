import getArchivedTasksConn from '../connections/getArchivedTasksConn'
import getTeamTasksConn from '../connections/getTeamTasksConn'
import getUserTasksConn from '../connections/getUserTasksConn'
import pluralizeHandler from './pluralizeHandler'
import getNodeById from '../../utils/relay/getNodeById'
import {insertEdgeAfter} from '../../utils/relay/insertEdge'
import safeRemoveNodeFromConn from '../../utils/relay/safeRemoveNodeFromConn'
import {ConnectionHandler, RecordSourceSelectorProxy} from 'relay-runtime'
import addNodeToArray from '../../utils/relay/addNodeToArray'
import {RecordProxy} from 'relay-runtime'
import {ThreadSourceEnum} from 'types/graphql'
import getReflectionGroupTasksConn from 'mutations/connections/getReflectionGroupTasksConn'

type Task = RecordProxy<{
  readonly id: string
  readonly teamId: string
  readonly tags: readonly string[]
  readonly threadId: string | null
  readonly meetingId: string | null
  readonly updatedAt: string | null
  readonly userId: string
}>

const handleUpsertTask = (task: Task | null, store: RecordSourceSelectorProxy<any>) => {
  if (!task) return
  // we currently have 3 connections, user, team, and team archive
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!viewer) return
  const viewerId = viewer.getDataID()
  const teamId = task.getValue('teamId')
  const taskId = task.getValue('id')
  const tags = task.getValue('tags')
  const threadSource = task.getValue('threadSource')
  const reflectionGroupId =
    threadSource === ThreadSourceEnum.REFLECTION_GROUP ? task.getValue('threadId') : undefined
  const meetingId = task.getValue('meetingId')
  const isNowArchived = tags.includes('archived')
  const archiveConn = getArchivedTasksConn(viewer, teamId)
  const team = store.get(teamId)
  const teamConn = getTeamTasksConn(team)
  const userConn = getUserTasksConn(viewer)
  const reflectionGroup = (reflectionGroupId && store.get(reflectionGroupId)) || null
  const reflectionGroupConn = getReflectionGroupTasksConn(reflectionGroup)
  const meeting = meetingId && store.get(meetingId)
  const safePutNodeInConn = (
    conn: RecordProxy | null | undefined,
    sortValue = 'updatedAt',
    isAscending?: boolean
  ) => {
    if (conn && !getNodeById(taskId, conn)) {
      const newEdge = ConnectionHandler.createEdge(store, conn, task, 'TaskEdge')
      newEdge.setValue(task.getValue(sortValue), 'cursor')
      const options = {isAscending}
      insertEdgeAfter(conn, newEdge, sortValue, options)
    }
  }

  if (isNowArchived) {
    safeRemoveNodeFromConn(taskId, teamConn)
    safeRemoveNodeFromConn(taskId, userConn)
    safePutNodeInConn(archiveConn)
  } else {
    safeRemoveNodeFromConn(taskId, archiveConn)
    safePutNodeInConn(teamConn)
    safePutNodeInConn(reflectionGroupConn, 'threadSortOrder', true)
    addNodeToArray(task, meeting, 'tasks', 'createdAt')
    if (userConn) {
      const ownedByViewer = task.getValue('userId') === viewerId
      if (ownedByViewer) {
        safePutNodeInConn(userConn)
      } else {
        safeRemoveNodeFromConn(taskId, userConn)
      }
    }
  }
}

const handleUpsertTasks = pluralizeHandler(handleUpsertTask)
export default handleUpsertTasks
