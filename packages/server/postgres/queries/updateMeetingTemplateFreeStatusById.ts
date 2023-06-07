import getPg from '../getPg'

const updateMeetingTemplateFreeStatusById = async (templateIds: string[], isFree: boolean) => {
  const pg = getPg()
  return pg.query<string[]>(
    `UPDATE "MeetingTemplate" SET "isFree" = $1 WHERE id in $2 RETURNING id;`,
    [isFree, templateIds]
  )
}

export default updateMeetingTemplateFreeStatusById
