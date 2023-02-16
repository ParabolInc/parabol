import getRethink from '../../database/rethinkDriver'
import MeetingTemplate from '../../database/types/MeetingTemplate'
import getPg from '../getPg'

const insertMeetingTemplate = async (meetingTemplate: MeetingTemplate) => {
  const r = await getRethink()
  const pg = getPg()
  const {id, name, teamId, orgId, parentTemplateId, type, scope, lastUsedAt, isStarter, isFree, } =
    meetingTemplate
  const [rRes, pgRes] = await Promise.allSettled([
    r.table('MeetingTemplate').insert(meetingTemplate).run(),
    pg.query(
      `INSERT INTO "MeetingTemplate" (id, name, "teamId", "orgId", "parentTemplateId", type, scope, "lastUsedAt", "isStarter", "isFree") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, name, teamId, orgId, parentTemplateId, type, scope, lastUsedAt, isStarter, isFree]
    )
  ])
  if (pgRes.status === 'rejected') console.log(pgRes.reason)
  if (rRes.status === 'rejected') throw rRes.reason
}

export default insertMeetingTemplate
