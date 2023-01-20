import getRethink from '../../database/rethinkDriver'
import {SharingScopeEnum} from '../../database/types/MeetingTemplate'
import getPg from '../getPg'

const updateMeetingTemplateScope = async (templateId: string, scope: SharingScopeEnum) => {
  const r = await getRethink()
  const now = new Date()
  const pg = getPg()
  const rPromise = r.table('MeetingTemplate').get(templateId).update({scope, updatedAt: now}).run()

  try {
    await pg.query(`UPDATE "MeetingTemplate" SET scope = $1 WHERE id = $2;`, [scope, templateId])
  } catch {}

  await rPromise
}

export default updateMeetingTemplateScope
