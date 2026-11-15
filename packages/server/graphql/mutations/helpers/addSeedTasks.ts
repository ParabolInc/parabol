import {
  SEED_INTEGRATIONS_TASK_TEXT as INTEGRATIONS_TASK_STRING,
  SEED_TASK_TEXT as NORMAL_TASK_STRING
} from 'parabol-client/utils/isSeedTask'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import {getTagsFromTipTapTask} from '../../../../client/shared/tiptap/getTagsFromTipTapTask'
import {serverTipTapExtensions} from '../../../../client/shared/tiptap/serverTipTapExtensions'
import appOrigin from '../../../appOrigin'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import loadHTMLConverters from '../../../utils/tiptap/loadHTMLConverters'

async function getSeedTasks(teamId: string) {
  const {generateJSON} = await loadHTMLConverters()
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

  const seedTasks = (await getSeedTasks(teamId)).map((proj) => ({
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
