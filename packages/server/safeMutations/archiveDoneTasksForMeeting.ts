import {sql} from 'kysely'
import {selectTasks} from '../postgres/select'
import archiveTasksForDB from './archiveTasksForDB'

// Selects all Done tasks for the team that haven't already been archived, archives them
// under the given meetingId, and returns the archived task IDs. Used by both check-in and
// retrospective end flows when the meeting includes a phase that reviews team tasks.
const archiveDoneTasksForMeeting = async (teamId: string, meetingId: string) => {
  const doneTasks = await selectTasks()
    .where('teamId', '=', teamId)
    .where('status', '=', 'done')
    .where(sql<boolean>`'archived' != ALL(tags)`)
    .execute()
  return archiveTasksForDB(doneTasks, meetingId)
}

export default archiveDoneTasksForMeeting
