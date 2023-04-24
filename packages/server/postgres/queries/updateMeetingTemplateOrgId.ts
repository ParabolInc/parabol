import getPg from '../getPg'

const updateMeetingTemplateOrgId = async (oldOrgId: string, newOrgId: string) => {
  const pg = getPg()
  await pg.query(`UPDATE "MeetingTemplate" SET "orgId" = $1 WHERE "orgId" = $2;`, [
    newOrgId,
    oldOrgId
  ])
}

export default updateMeetingTemplateOrgId
