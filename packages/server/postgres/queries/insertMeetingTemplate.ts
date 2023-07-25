import MeetingTemplate from '../../database/types/MeetingTemplate'
import getPg from '../getPg'

const insertMeetingTemplate = async (meetingTemplate: MeetingTemplate) => {
  const pg = getPg()
  const {
    id,
    name,
    teamId,
    orgId,
    parentTemplateId,
    type,
    scope,
    lastUsedAt,
    isStarter,
    isFree,
    mainCategory,
    illustrationUrl
  } = meetingTemplate
  await pg.query(
    `INSERT INTO "MeetingTemplate" (id, name, "teamId", "orgId", "parentTemplateId", type, scope, "lastUsedAt", "isStarter", "isFree", "mainCategory", "illustrationUrl") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      id,
      name,
      teamId,
      orgId,
      parentTemplateId,
      type,
      scope,
      lastUsedAt,
      isStarter,
      isFree,
      mainCategory,
      illustrationUrl
    ]
  )
}

export default insertMeetingTemplate
