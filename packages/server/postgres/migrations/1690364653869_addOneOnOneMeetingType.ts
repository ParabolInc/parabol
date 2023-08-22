import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()

  const getTemplateIllustrationUrl = (filename: string) => {
    const cdnType = process.env.FILE_STORE_PROVIDER
    const partialPath = `Organization/aGhostOrg/template/${filename}`
    if (cdnType === 'local') {
      return `/self-hosted/${partialPath}`
    } else {
      const {CDN_BASE_URL} = process.env
      if (!CDN_BASE_URL) throw new Error('Missng Env: CDN_BASE_URL')
      const hostPath = CDN_BASE_URL.replace(/^\/+/, '')
      return `https://${hostPath}/store/${partialPath}`
    }
  }

  const oneOnOneActivity = {
    id: 'oneOnOneAction',
    type: 'action',
    name: 'One on One',
    isFree: true,
    illustrationUrl: getTemplateIllustrationUrl('action.png'),
    isStarter: true,
    lastUsedAt: null,
    mainCategory: 'standup',
    orgId: 'aGhostOrg',
    parentTemplateId: null,
    scope: 'PUBLIC',
    teamId: 'aGhostTeam'
  }
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
  } = oneOnOneActivity

  await client.query(
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

  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`DELETE FROM "MeetingTemplate" WHERE id = 'oneOnOneAction';`)
  await client.end()
}
