import {SharingScopeEnum} from '../../database/types/MeetingTemplate'
import getPg from '../getPg'

const updateMeetingTemplateScope = async (templateId: string, scope: SharingScopeEnum) => {
  const pg = getPg()
  await pg.query(`UPDATE "MeetingTemplate" SET scope = $1 WHERE id = $2;`, [scope, templateId])
}

export default updateMeetingTemplateScope
