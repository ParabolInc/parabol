import {OrgUserAuditEventTypeEnum} from '../types/OrgUserAuditEventTypeEnum'
import getPgPool from '../getPgPool'
import pgFormat from 'pg-format'

export const insertRow = async (
  orgIds: string[],
  userId: string,
  eventType: OrgUserAuditEventTypeEnum,
  eventDate: Date = new Date()
) => {
  const pgPool = await getPgPool()
  const text = `
    INSERT INTO "OrganizationUserAudit" (
      "orgId",
      "userId",
      "eventDate",
      "eventType"
    ) VALUES %L;
  `
  const eventDateStr = eventDate.toISOString()
  const rowValues = orgIds.map((orgId) => [orgId, userId, eventDateStr, eventType])
  await pgPool.query(pgFormat(text, rowValues))
}
