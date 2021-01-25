import {insertOrgUserAudit as insertQuery} from '../queries/OrgUserAudit'
import getPgClient from '../getPgClient'
import OrgUserAuditEventTypeEnum from '../types/OrgUserAuditEventTypeEnum'

export const insertOrgUserAudit = async (
  orgIds: string[],
  userId: string,
  eventType: OrgUserAuditEventTypeEnum,
  eventDate: Date = new Date()
) => {
  const pgClient = await getPgClient()
  const auditRows = orgIds.map((orgId) => ({orgId, userId, eventType, eventDate}))
  const parameters = {auditRows}
  await insertQuery.run(parameters, pgClient)
  pgClient.release()
}
