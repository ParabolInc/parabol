import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../../appOrigin'
import {TaskStatusEnum} from '../../../database/types/Task'
import {convertHtmlToTaskContent} from '../../../utils/draftjs/convertHtmlToTaskContent'
import {addTasks} from './addTasks'

const INVITE_TASK_STRING = `🎉 Welcome to your new team! You can now start inviting your teammates`

const addTeamTasks = async (userId: string, teamId: string) => {
  const inviteURL = makeAppURL(appOrigin, `team/${teamId}`, {
    searchParams: {
      invite: 'true'
    }
  })
  const inviteTeamTaskHTML = `🎉 Welcome to your new team! You can now start <a href="${inviteURL}" target="_self">inviting your teammates</a>`

  const teamTasks = [
    {
      status: 'active' as TaskStatusEnum,
      sortOrder: 0,
      content: convertHtmlToTaskContent(inviteTeamTaskHTML),
      plaintextContent: INVITE_TASK_STRING
    }
  ]

  return await addTasks(teamTasks, teamId, userId)
}

export default addTeamTasks
