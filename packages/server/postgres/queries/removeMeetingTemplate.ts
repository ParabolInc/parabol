import getRethink from '../../database/rethinkDriver'
import getPg from '../getPg'

const removeMeetingTemplate = async (templateId: string) => {
  const r = await getRethink()
  const pg = getPg()
  const now = new Date()
  await Promise.allSettled([
    r.table('MeetingTemplate').get(templateId).update({isActive: false, updatedAt: now}).run(),
    pg.query(`UPDATE "MeetingTemplate" SET "isActive" = FALSE WHERE id = $1;`, [templateId])
  ])
}

export default removeMeetingTemplate
