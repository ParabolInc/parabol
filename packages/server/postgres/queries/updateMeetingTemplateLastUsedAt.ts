import getRethink from '../../database/rethinkDriver'
import getPg from '../getPg'

const updateMeetingTemplateLastUsedAt = async (templateId: string) => {
  const now = new Date()
  const r = await getRethink()
  const rPromise = r.table('MeetingTemplate').get(templateId).update({lastUsedAt: now}).run()
  const pg = getPg()
  try {
    await pg.query(`UPDATE "MeetingTemplate" SET "lastUsedAt" = CURRENT_TIMESTAMP WHERE id = $1;`, [
      templateId
    ])
  } catch {}
  await rPromise
}

export default updateMeetingTemplateLastUsedAt
