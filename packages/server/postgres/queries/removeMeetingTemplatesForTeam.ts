import getRethink from '../../database/rethinkDriver'
import getPg from '../getPg'

const removeMeetingTemplatesForTeam = async (teamId: string) => {
  const r = await getRethink()
  const pg = getPg()
  const now = new Date()
  const [rRes] = await Promise.allSettled([
    r
      .table('MeetingTemplate')
      .getAll(teamId, {index: 'teamId'})
      .update({isActive: false, updatedAt: now})
      .run(),
    pg.query(`UPDATE "MeetingTemplate" SET "isActive" = FALSE WHERE "teamId" = $1;`, [teamId])
  ])
  if (rRes.status === 'rejected') throw rRes.reason
}

export default removeMeetingTemplatesForTeam
