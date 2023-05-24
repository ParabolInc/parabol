import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const getTemplateIllustrationUrl = (filename: string) => {
    const cdnType = process.env.FILE_STORE_PROVIDER
    const partialPath = `store/Organization/aGhostOrg/${filename}`
    if (cdnType === 'local') {
      return `/self-hosted/${partialPath}`
    }
    const hostPath = process.env.CDN_BASE_URL!.replace(/^\/+/, '')
    return `https://${hostPath}/${partialPath}`
  }

  const client = new Client(getPgConfig())
  await client.connect()
  const teamPromptActivity = {
    id: 'teamPrompt',
    type: 'teamPrompt',
    name: 'Standup',
    team: {name: 'Parabol'},
    category: 'standup',
    isRecommended: true,
    isFree: true,
    createdAt: new Date('2023-04-01'),
    illustrationUrl: getTemplateIllustrationUrl('teamPrompt.png'),
    isActive: true,
    isStarter: true,
    lastUsedAt: null,
    mainCategory: 'standup',
    orgId: 'aGhostOrg',
    parentTemplateId: null,
    scope: 'PUBLIC',
    teamId: 'aGhostTeam',
    updatedAt: new Date('2023-04-01')
  }

  const checkinActivity = {
    id: 'action',
    type: 'action',
    name: 'Check-in',
    team: {name: 'Parabol'},
    category: 'standup',
    isRecommended: true,
    isFree: true,
    createdAt: new Date('2016-06-01'),
    illustrationUrl: getTemplateIllustrationUrl('action.png'),
    isActive: true,
    isStarter: true,
    lastUsedAt: null,
    mainCategory: 'standup',
    orgId: 'aGhostOrg',
    parentTemplateId: null,
    scope: 'PUBLIC',
    teamId: 'aGhostTeam',
    updatedAt: new Date('2016-06-01')
  }
  const fixedActivities = [teamPromptActivity, checkinActivity]
  await Promise.all(
    fixedActivities.map((activity) => {
      const {
        id,
        name,
        teamId,
        orgId,
        parentTemplateId,
        type,
        scope,
        lastUsedAt,
        isStarter,
        isFree,
        mainCategory,
        illustrationUrl
      } = activity

      return client.query(
        `INSERT INTO "MeetingTemplate" (id, name, "teamId", "orgId", "parentTemplateId", type, scope, "lastUsedAt", "isStarter", "isFree", "mainCategory", "illustrationUrl") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          id,
          name,
          teamId,
          orgId,
          parentTemplateId,
          type,
          scope,
          lastUsedAt,
          isStarter,
          isFree,
          mainCategory,
          illustrationUrl
        ]
      )
    })
  )
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`DELETE FROM "MeetingTemplate" WHERE id = 'action' OR id= 'teampPrompt';`)
  await client.end()
}
