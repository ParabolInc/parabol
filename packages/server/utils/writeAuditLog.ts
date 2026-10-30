import {getLogIdentity} from './Logger'

const writeAuditLog = (fields: Record<string, unknown>) => {
  console.log(
    JSON.stringify({
      time: new Date().toISOString(),
      severity: 'NOTICE',
      level: 'info',
      type: 'audit',
      ...getLogIdentity(),
      ...fields
    })
  )
}

export default writeAuditLog
