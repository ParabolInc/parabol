import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../../appOrigin'
import {TaskStatusEnum} from '../../../database/types/Task'
import {convertHtmlToTaskContent} from '../../../utils/draftjs/convertHtmlToTaskContent'
import {addTasks} from './addTasks'

const INVITE_TASK_STRING = `Congratulations on your new team! You can now start inviting your teammates`
const NEW_MEETING_TASK_STRING = `Start a meeting with your team`

const addTeamTasks = async (userId: string, teamId: string) => {
  const inviteURL = makeAppURL(appOrigin, `team/${teamId}`, {
    searchParams: {
      invite: 'true'
    }
  })
  const inviteTeamTaskHTML = `Congratulations on your new team! You can now start <a href="${inviteURL}">inviting your teammates</a>`

  const newMeetingURL = makeAppURL(appOrigin, `/new-meeting/${teamId}`, {
    searchParams: {
      source: 'TeamTask'
    }
  })
  const newMeetingTaskHTML = `<a href="${newMeetingURL}">Start a meeting</a> with your team`

  const teamTasks = [
    {
      status: 'active' as TaskStatusEnum,
      sortOrder: 1,
      content: convertHtmlToTaskContent(inviteTeamTaskHTML),
      plaintextContent: INVITE_TASK_STRING
    },
    {
      status: 'active' as TaskStatusEnum,
      sortOrder: 0,
      content: convertHtmlToTaskContent(newMeetingTaskHTML),
      plaintextContent: NEW_MEETING_TASK_STRING
    }
  ]

  return await addTasks(teamTasks, teamId, userId)
}

export default addTeamTasks
