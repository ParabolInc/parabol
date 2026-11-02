import type AuthToken from './database/types/AuthToken'
import writeAuditLog from './utils/writeAuditLog'

interface AuditedOperation {
  authToken: AuthToken | null
  personalAccessTokenId?: string
  ip: string
  operation: string
  variables: unknown
  failureReason?: string
}

export const logOperation = ({
  authToken,
  personalAccessTokenId,
  ip,
  operation,
  variables,
  failureReason
}: AuditedOperation) => {
  writeAuditLog({
    userId: authToken?.sub ?? '',
    ...(authToken?.act && {impersonatorId: authToken.act.sub}),
    ...(personalAccessTokenId && {personalAccessTokenId}),
    ipAddress: ip,
    operation,
    variables,
    outcome: failureReason === undefined ? 'success' : 'failure',
    ...(failureReason !== undefined && {reason: failureReason})
  })
}
