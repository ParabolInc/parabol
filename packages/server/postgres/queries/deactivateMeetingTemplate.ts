import getRethink from '../../database/rethinkDriver'
import getPg from '../getPg'

const deactivateMeetingTemplate = async (templateId: string) => {
  const r = await getRethink()
  const pg = getPg()
  const now = new Date()
  const rethinkPromise = r
    .table('MeetingTemplate')
    .get(templateId)
    .update({isActive: false, updatedAt: now})
    .run()

  try {
    await pg.query(`UPDATE "MeetingTemplate" SET "isActive" = FALSE WHERE id = $1;`, [templateId])
  } catch {
    // ignore failures
  }
  await rethinkPromise
}

export default deactivateMeetingTemplate
