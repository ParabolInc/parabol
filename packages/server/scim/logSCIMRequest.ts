import SCIMMY from 'scimmy'
import writeAuditLog from '../utils/writeAuditLog'

export const logSCIMRequest = (
  scimId: string,
  ip: string,
  request: {operation: string; instance?: SCIMMY.Types.Schema}
) => {
  writeAuditLog({
    scimId,
    ipAddress: ip,
    operation: request.operation,
    variables: request.instance
  })
}
