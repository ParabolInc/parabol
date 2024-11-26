import {generateJSON} from '@tiptap/html'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import {getTagsFromTipTapTask} from '../../../../client/shared/tiptap/getTagsFromTipTapTask'
import {serverTipTapExtensions} from '../../../../client/shared/tiptap/serverTipTapExtensions'
import appOrigin from '../../../appOrigin'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'

const NORMAL_TASK_STRING = `This is a task card. They can be created here, in a meeting, or via an integration`
const INTEGRATIONS_TASK_STRING = `Parabol supports integrations for Jira, GitHub, GitLab, Slack and Mattermost. Connect your tools in Settings > Integrations.`

function getSeedTasks(teamId: string) {
  const searchParams = {
    utm_source: 'new user seed task card',
    utm_medium: 'product',
    utm_campaign: 'onboarding'
  }
  const options = {searchParams}
  const integrationURL = makeAppURL(appOrigin, `team/${teamId}/integrations`, options)
  return [
    {
      status: 'active' as const,
      sortOrder: 1,
      content: JSON.stringify(generateJSON(`<p>${NORMAL_TASK_STRING}</p>`, serverTipTapExtensions)),
      plaintextContent: NORMAL_TASK_STRING
    },
    {
      status: 'active' as const,
      sortOrder: 0,
      content: JSON.stringify(
        generateJSON(
          `<p>Parabol supports integrations for Jira, GitHub, GitLab, Slack and Mattermost. Connect your tools in <a href="${integrationURL}">Integrations</a>.</p>`,
          serverTipTapExtensions
        )
      ),
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
    tags: getTagsFromTipTapTask(JSON.parse(proj.content)),
    teamId,
    userId,
    updatedAt: now
  }))
  await pg.insertInto('Task').values(seedTasks).execute()
}
