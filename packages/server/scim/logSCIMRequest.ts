import SCIMMY from 'scimmy'

const AUDIT_LOGS = process.env.AUDIT_LOGS === 'true'

export const logSCIMRequest = (
  scimId: string,
  ip: string,
  request: {operation: string; userId?: string; instance?: SCIMMY.Types.Schema}
) => {
  if (!AUDIT_LOGS) return
  const auditLog = {
    time: new Date().toISOString(),
    level: 'info',
    type: 'audit',
    scimId,
    ipAddress: ip,
    operation: request.operation,
    variables: request.instance
  }
  console.log(JSON.stringify(auditLog))
}
