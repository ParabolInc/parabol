import getRethink from '../../database/rethinkDriver'
import getPg from '../getPg'

const updateMeetingTemplateLastUsedAt = async (templateId: string) => {
  const now = new Date()
  const r = await getRethink()
  const pg = getPg()
  await Promise.allSettled([
    r.table('MeetingTemplate').get(templateId).update({lastUsedAt: now}).run(),
    pg.query(`UPDATE "MeetingTemplate" SET "lastUsedAt" = CURRENT_TIMESTAMP WHERE id = $1;`, [
      templateId
    ])
  ])
}

export default updateMeetingTemplateLastUsedAt
