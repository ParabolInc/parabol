import getPg from '../getPg'

const updateMeetingTemplateLastUsedAt = async (templateId: string) => {
  const pg = getPg()
  await pg.query(`UPDATE "MeetingTemplate" SET "lastUsedAt" = CURRENT_TIMESTAMP WHERE id = $1;`, [
    templateId
  ])
}

export default updateMeetingTemplateLastUsedAt
