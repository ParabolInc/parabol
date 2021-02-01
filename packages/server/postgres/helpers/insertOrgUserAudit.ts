import getPg from '../getPg'
import z from '../getZapatos'
import parseDates from '../utils/parseDates'
import type * as s from 'zapatos/schema'

const insertOrgUserAudit = async (
  orgIds: string[],
  userId: string,
  eventType: s.OrganizationUserAuditEventTypeEnum,
  eventDate: Date = new Date()
): Promise<s.OrganizationUserAudit.Selectable[]> => {
  const pg = getPg()
  const auditRows = orgIds.map(orgId => ({orgId, userId, eventType, eventDate}))
  const result = await z.insert('OrganizationUserAudit', auditRows).run(pg)
  const mappedRows = parseDates(result)
  return mappedRows
}

export default insertOrgUserAudit
