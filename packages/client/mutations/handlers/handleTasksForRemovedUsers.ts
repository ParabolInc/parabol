import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import handleRemoveTasks from './handleRemoveTasks'
import handleUpsertTasks from './handleUpsertTasks'

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

const handleTasksForRemovedUsers = (
  tasks: Task[],
  removedUserIds: string[],
  viewerId: string,
  store: RecordSourceSelectorProxy<any>
) => {
  const isViewerRemoved = removedUserIds.includes(viewerId)

  tasks.forEach((task) => {
    const taskUserId = task.getValue('userId')!
    const taskId = task.getValue('id')
    if (typeof taskId !== 'string') return

    if (isViewerRemoved) {
      // If viewer is removed, remove all of the updated tasks from their view
      handleRemoveTasks(taskId, store)
    } else {
      // If viewer stays, only handle tasks they can see:
      // - Tasks they own
      // - Tasks owned by removed users (which are either archived or reassigned)
      if (taskUserId === viewerId || removedUserIds.includes(taskUserId)) {
        const hasIntegration = task.getLinkedRecord('integration') !== null
        if (removedUserIds.includes(taskUserId) && hasIntegration) {
          // Integrated tasks owned by removed users are archived
          handleRemoveTasks(taskId, store)
        } else {
          // Non-integrated tasks owned by removed users are reassigned
          handleUpsertTasks(task, store)
        }
      }
    }
  })
}

export default handleTasksForRemovedUsers
