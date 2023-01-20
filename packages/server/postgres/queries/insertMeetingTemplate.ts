import getRethink from '../../database/rethinkDriver'
import MeetingTemplate from '../../database/types/MeetingTemplate'
import getPg from '../getPg'

const insertMeetingTemplate = async (meetingTemplate: MeetingTemplate) => {
  const r = await getRethink()
  const pg = getPg()
  const {id, name, teamId, orgId, parentTemplateId, type} = meetingTemplate
  const values = [id, name, teamId, orgId, parentTemplateId, type]
  const rPromise = r.table('MeetingTemplate').insert(meetingTemplate).run()
  try {
    await pg.query(
      `INSERT INTO "MeetingTemplate" (id, name, "teamId", "orgId", "parentTemplateId", type) VALUES ($1, $2, $3, $4, $5, $6)`,
      values
    )
  } catch {}
  await rPromise
}

export default insertMeetingTemplate
