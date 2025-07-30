import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import type {Task} from '../postgres/types'

const filterTasksByMeeting = (tasks: Task[], meetingId: string, viewerId: string) => {
  return tasks.filter((task) => {
    if (task.meetingId !== meetingId) return false
    if (isTaskPrivate(task.tags) && task.userId !== viewerId) return false
    return true
  })
}

export default filterTasksByMeeting
