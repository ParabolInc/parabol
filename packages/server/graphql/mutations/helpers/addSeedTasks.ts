import convertToTaskContent from 'parabol-client/utils/draftjs/convertToTaskContent'
import getTagsFromEntityMap from 'parabol-client/utils/draftjs/getTagsFromEntityMap'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../../appOrigin'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import {TaskStatusEnum} from '../../../database/types/Task'
import generateUID from '../../../generateUID'
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
  const integrationURL = makeAppURL(appOrigin, `team/${teamId}/settings/integrations`, options)
  const integrationTaskHTML = `Parabol supports integrations for Jira, GitHub, GitLab, Slack and Mattermost. Connect your tools on <a href="${integrationURL}">Settings > Integrations</a>.`

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
  const r = await getRethink()
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

  return r
    .table('Task')
    .insert(seedTasks, {returnChanges: true})
    .do((result: RValue) => {
      return r.table('TaskHistory').insert(
        result('changes').map((change: RValue) => ({
          id: generateUID(),
          content: change('new_val')('content'),
          taskId: change('new_val')('id'),
          status: change('new_val')('status'),
          teamId: change('new_val')('teamId'),
          userId: change('new_val')('userId'),
          updatedAt: change('new_val')('updatedAt')
        }))
      )
    })
    .run()
}
