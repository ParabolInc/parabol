import {getLogIdentity, makeTraceFields} from './Logger'
import {getLogContext} from './requestLogContext'

const writeAuditLog = (fields: Record<string, unknown>) => {
  if (process.env.AUDIT_LOGS !== 'true') return
  const context = getLogContext() ?? {}
  console.log(
    JSON.stringify({
      time: new Date().toISOString(),
      severity: 'NOTICE',
      level: 'info',
      type: 'audit',
      ...getLogIdentity(),
      ...makeTraceFields(context),
      ...(context.sessionId && {sessionId: context.sessionId}),
      ...fields
    })
  )
}

export default writeAuditLog
