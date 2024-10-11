import convertToTaskContent from 'parabol-client/utils/draftjs/convertToTaskContent'
import getTagsFromEntityMap from 'parabol-client/utils/draftjs/getTagsFromEntityMap'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../../appOrigin'
import {TaskStatusEnum} from '../../../database/types/Task'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {convertHtmlToTaskContent} from '../../../utils/draftjs/convertHtmlToTaskContent'

const NORMAL_TASK_STRING = `This is a task card. They can be created here, in a meeting, or via an integration`
const INTEGRATIONS_TASK_STRING = `Parabol supports integrations for Jira, GitHub, GitLab, Slack and Mattermost. Connect your tools on Settings > Integrations.`

function getSeedTasks(teamId: string) {
  const searchParams = {
    utm_source: 'new user seed task card',
    utm_medium: 'product',
    utm_campaign: 'onboarding'
  }
  const options = {searchParams}
  const integrationURL = makeAppURL(appOrigin, `team/${teamId}/integrations`, options)
  const integrationTaskHTML = `Parabol supports integrations for Jira, GitHub, GitLab, Slack and Mattermost. Connect your tools in <a href="${integrationURL}">Integrations</a>.`

  return [
    {
      status: 'active' as TaskStatusEnum,
      sortOrder: 1,
      content: convertToTaskContent(NORMAL_TASK_STRING),
      plaintextContent: NORMAL_TASK_STRING
    },
    {
      status: 'active' as TaskStatusEnum,
      sortOrder: 0,
      content: convertHtmlToTaskContent(integrationTaskHTML),
      plaintextContent: INTEGRATIONS_TASK_STRING
    }
  ]
}

export default async (userId: string, teamId: string) => {
  const pg = getKysely()
  const now = new Date()

  const seedTasks = getSeedTasks(teamId).map((proj) => ({
    ...proj,
    id: `${teamId}::${generateUID()}`,
    createdAt: now,
    createdBy: userId,
    tags: getTagsFromEntityMap(JSON.parse(proj.content).entityMap),
    teamId,
    userId,
    updatedAt: now
  }))
  await pg.insertInto('Task').values(seedTasks).execute()
}
