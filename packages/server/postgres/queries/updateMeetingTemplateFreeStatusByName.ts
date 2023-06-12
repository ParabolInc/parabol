import getPg from '../getPg'

const updateMeetingTemplateFreeStatusByName = async (templateNames: string[], isFree: boolean) => {
  const pg = getPg()
  return pg.query<string[]>(
    `UPDATE "MeetingTemplate" SET "isFree" = $1 WHERE "teamId" = 'aGhostTeam' AND name LIKE ANY($2) RETURNING id;`,
    [isFree, templateNames]
  )
}

export default updateMeetingTemplateFreeStatusByName
