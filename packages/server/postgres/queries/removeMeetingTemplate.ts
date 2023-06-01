import getPg from '../getPg'

const removeMeetingTemplate = async (templateId: string) => {
  const pg = getPg()
  await pg.query(`UPDATE "MeetingTemplate" SET "isActive" = FALSE WHERE id = $1;`, [templateId])
}

export default removeMeetingTemplate
