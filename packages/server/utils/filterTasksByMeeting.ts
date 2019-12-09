import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import Task from '../database/types/Task'

const filterTasksByMeeting = (tasks: Task[], meetingId: string, viewerId: string) => {
  return tasks.filter((task) =>
    task.meetingId === meetingId && isTaskPrivate(task.tags) ? task.userId === viewerId : true
  )
}

export default filterTasksByMeeting
