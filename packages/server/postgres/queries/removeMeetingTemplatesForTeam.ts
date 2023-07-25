import getPg from '../getPg'

const removeMeetingTemplatesForTeam = async (teamId: string) => {
  const pg = getPg()
  await pg.query(`UPDATE "MeetingTemplate" SET "isActive" = FALSE WHERE "teamId" = $1;`, [teamId])
}

export default removeMeetingTemplatesForTeam
