import {OrganizationUserAuditEventTypeEnum} from '../types/OrganizationUserAuditEventTypeEnum'
import getPgPool from '../getPgPool'

export const insertRow = async (
  orgId: number,
  userId: number,
  eventType: OrganizationUserAuditEventTypeEnum,
  eventDate: Date = new Date(),
) => {
  const pgPool = await getPgPool()
  const text = `
    INSERT INTO "OrganizationUserAudit" (
      "orgId",
      "userId",
      "eventDate",
      "eventType"
    ) VALUES ($1, $2, $3, $4);
  `
  const values = [orgId, userId, eventDate.toISOString(), eventType]
  await pgPool.query(text, values)
}
