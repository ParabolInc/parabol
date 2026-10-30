import writeAuditLog from './utils/writeAuditLog'

const AUDIT_LOGS = process.env.AUDIT_LOGS === 'true'
export const logOperation = (
  userId: string,
  ip: string,
  operation: string,
  variables: Record<string, any>
) => {
  if (!AUDIT_LOGS) return
  writeAuditLog({
    userId,
    ipAddress: ip,
    operation,
    variables
  })
}
