const AUDIT_LOGS = process.env.AUDIT_LOGS === 'true'
export const logOperation = (
  userId: string,
  ip: string,
  operation: string,
  variables: Record<string, any>
) => {
  if (!AUDIT_LOGS) return
  const auditLog = {
    time: new Date().toISOString(),
    level: 'info',
    type: 'audit',
    userId,
    ipAddress: ip,
    operation,
    variables
  }
  console.log(JSON.stringify(auditLog))
}
