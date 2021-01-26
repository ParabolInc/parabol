import {insertOrgUserAuditQuery, OrganizationUserAuditEventTypeEnum} from '../queries/generated/insertOrgUserAuditQuery'
import getPG from '../getPG'

const insertOrgUserAudit = async (
  orgIds: string[],
  userId: string,
  eventType: OrganizationUserAuditEventTypeEnum,
  eventDate: Date = new Date()
) => {
  const pgPool = getPG()
  const auditRows = orgIds.map((orgId) => ({orgId, userId, eventType, eventDate}))
  const parameters = {auditRows}
  await insertOrgUserAuditQuery.run(parameters, pgPool)
}

export default insertOrgUserAudit
