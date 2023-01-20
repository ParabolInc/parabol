import getRethink from '../../database/rethinkDriver'
import getPg from '../getPg'

const removeMeetingTemplatesForTeam = async (teamId: string) => {
  const r = await getRethink()
  const pg = getPg()
  const now = new Date()
  await Promise.allSettled([
    r
      .table('MeetingTemplate')
      .getAll(teamId, {index: 'teamId'})
      .update({isActive: false, updatedAt: now})
      .run(),
    pg.query(`UPDATE "MeetingTemplate" SET "isActive" = FALSE WHERE "teamId" = $1;`, [teamId])
  ])
}

export default removeMeetingTemplatesForTeam
