import getRethink from '../../database/rethinkDriver'
import {SharingScopeEnum} from '../../database/types/MeetingTemplate'
import getPg from '../getPg'

const updateMeetingTemplateScope = async (templateId: string, scope: SharingScopeEnum) => {
  const r = await getRethink()
  const now = new Date()
  const pg = getPg()
  await Promise.allSettled([
    r.table('MeetingTemplate').get(templateId).update({scope, updatedAt: now}).run(),
    pg.query(`UPDATE "MeetingTemplate" SET scope = $1 WHERE id = $2;`, [scope, templateId])
  ])
}

export default updateMeetingTemplateScope
