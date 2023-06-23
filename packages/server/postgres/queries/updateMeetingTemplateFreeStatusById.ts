import getPg from '../getPg'

const updateMeetingTemplateFreeStatusById = async (templateIds: string[], isFree: boolean) => {
  const pg = getPg()
  const result = await pg.query<{id: string}>(
    `UPDATE "MeetingTemplate" SET "isFree" = $1 WHERE id in $2 RETURNING id;`,
    [isFree, templateIds]
  )
  return result.rows.map(({id}) => id)
}

export default updateMeetingTemplateFreeStatusById
