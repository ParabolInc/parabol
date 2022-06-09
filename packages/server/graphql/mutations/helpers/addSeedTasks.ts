import convertToTaskContent from 'parabol-client/utils/draftjs/convertToTaskContent'
import getTagsFromEntityMap from 'parabol-client/utils/draftjs/getTagsFromEntityMap'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import {convertHtmlToTaskContent} from '~/utils/draftjs/convertHtmlToTaskContent'
import appOrigin from '../../../appOrigin'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import {TaskStatusEnum} from '../../../database/types/Task'
import generateUID from '../../../generateUID'

const CONTENT_STRING = `
  This is a task card. They can be created here, in a meeting, or via an integration`

function getSeedTasks(teamId: string) {
  const integrationURL = makeAppURL(appOrigin, `team/${teamId}/settings`)

  const taskContent = `Parabol supports integrations for Jira, GitHub, GitLab, Slack and Mattermost. Connect your tools on Settings > Integrations.`
  const taskContentHTML = `Parabol supports integrations for Jira, GitHub, GitLab, Slack and Mattermost. Connect your tools on <a href="${integrationURL}">Settings > Integrations</a>.`

  const content = convertHtmlToTaskContent(taskContentHTML)

  return [
    {
      status: 'active' as TaskStatusEnum,
      sortOrder: 0,
      content: convertToTaskContent(CONTENT_STRING),
      plaintextContent: CONTENT_STRING
    },
    {
      status: 'active' as TaskStatusEnum,
      sortOrder: 1,
      content: content,
      plaintextContent: taskContent
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
