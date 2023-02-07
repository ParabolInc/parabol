import getRethink from '../../database/rethinkDriver'
import MeetingTemplate from '../../database/types/MeetingTemplate'
import getPg from '../getPg'

const insertMeetingTemplate = async (meetingTemplate: MeetingTemplate) => {
  const r = await getRethink()
  const pg = getPg()
  const {id, name, teamId, orgId, parentTemplateId, type} = meetingTemplate
  const [rRes, pgRes] = await Promise.allSettled([
    r.table('MeetingTemplate').insert(meetingTemplate).run(),
    pg.query(
      `INSERT INTO "MeetingTemplate" (id, name, "teamId", "orgId", "parentTemplateId", type) VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, name, teamId, orgId, parentTemplateId, type]
    )
  ])
  if (pgRes.status === 'rejected') console.log(pgRes.reason)
  if (rRes.status === 'rejected') throw rRes.reason
}

export default insertMeetingTemplate
