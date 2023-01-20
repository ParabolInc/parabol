import getRethink from '../../database/rethinkDriver'
import getPg from '../getPg'

const deactivateMeetingTemplatesForTeam = async (teamId: string) => {
  const r = await getRethink()
  const pg = getPg()
  const now = new Date()
  const rethinkPromise = r
    .table('MeetingTemplate')
    .getAll(teamId, {index: 'teamId'})
    .update({isActive: false, updatedAt: now})
    .run()

  try {
    await pg.query(`UPDATE "MeetingTemplate" SET "isActive" = FALSE WHERE "teamId" = $1;`, [teamId])
  } catch {
    // ignore failures
  }
  await rethinkPromise
}

export default deactivateMeetingTemplatesForTeam
