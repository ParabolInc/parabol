import getRethink from '../../database/rethinkDriver'
import getPg from '../getPg'

const updateMeetingTemplateLastUsedAt = async (templateId: string) => {
  const now = new Date()
  const r = await getRethink()
  const pg = getPg()
  const [rRes] = await Promise.allSettled([
    r.table('MeetingTemplate').get(templateId).update({lastUsedAt: now, updatedAt: now}).run(),
    pg.query(`UPDATE "MeetingTemplate" SET "lastUsedAt" = CURRENT_TIMESTAMP WHERE id = $1;`, [
      templateId
    ])
  ])
  if (rRes.status === 'rejected') throw rRes.reason
}

export default updateMeetingTemplateLastUsedAt
