import convertToTaskContent from 'parabol-client/utils/draftjs/convertToTaskContent'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../../appOrigin'
import {TaskStatusEnum} from '../../../database/types/Task'
import {convertHtmlToTaskContent} from '../../../utils/draftjs/convertHtmlToTaskContent'
import {addTasks} from './addTasks'

const NORMAL_TASK_STRING = `This is a task card. They can be created here, in a meeting, or via an integration`
const INTEGRATIONS_TASK_STRING = `Parabol supports integrations for Jira, GitHub, GitLab, Slack and Mattermost. Connect your tools on Settings > Integrations.`

function getSeedTasks(teamId: string) {
  const integrationURL = makeAppURL(appOrigin, `team/${teamId}/settings/integrations`)
  const integrationTaskHTML = `Parabol supports integrations for Jira, GitHub, GitLab, Slack and Mattermost. Connect your tools on <a href="${integrationURL}">Settings > Integrations</a>.`

  return [
    {
      status: 'active' as TaskStatusEnum,
      sortOrder: 2,
      content: convertToTaskContent(NORMAL_TASK_STRING),
      plaintextContent: NORMAL_TASK_STRING
    },
    {
      status: 'active' as TaskStatusEnum,
      sortOrder: 1,
      content: convertHtmlToTaskContent(integrationTaskHTML),
      plaintextContent: INTEGRATIONS_TASK_STRING
    }
  ]
}

const addSeedTasks = async (userId: string, teamId: string) => {
  const seedTasks = getSeedTasks(teamId)
  return await addTasks(seedTasks, teamId, userId)
}

export default addSeedTasks
