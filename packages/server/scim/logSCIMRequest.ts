import SCIMMY from 'scimmy'
import writeAuditLog from '../utils/writeAuditLog'

const AUDIT_LOGS = process.env.AUDIT_LOGS === 'true'

export const logSCIMRequest = (
  scimId: string,
  ip: string,
  request: {operation: string; instance?: SCIMMY.Types.Schema}
) => {
  if (!AUDIT_LOGS) return
  writeAuditLog({
    scimId,
    ipAddress: ip,
    operation: request.operation,
    variables: request.instance
  })
}
