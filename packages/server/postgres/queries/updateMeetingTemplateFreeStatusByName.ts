import getPg from '../getPg'

const updateMeetingTemplateFreeStatusByName = async (templateNames: string[], isFree: boolean) => {
  const pg = getPg()
  const result = await pg.query<{id: string}>(
    `UPDATE "MeetingTemplate" SET "isFree" = $1 WHERE "teamId" = 'aGhostTeam' AND name LIKE ANY($2) RETURNING id;`,
    [isFree, templateNames]
  )
  return result.rows.map(({id}) => id)
}

export default updateMeetingTemplateFreeStatusByName
