import getPg from '../getPg'

const updateMeetingTemplateName = async (templateId: string, name: string) => {
  const pg = getPg()

  await pg.query(`UPDATE "MeetingTemplate" SET name = $1 WHERE id = $2;`, [name, templateId])
}

export default updateMeetingTemplateName
