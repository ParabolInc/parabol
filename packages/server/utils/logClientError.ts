import {Logger} from './Logger'
import type {ClientErrorReport} from './parseClientErrorBatch'
import {runWithLogContext} from './requestLogContext'
import symbolicateClientStack from './symbolicateClientStack'

export const CLIENT_LOG_SERVICE = 'parabol-client'

const logClientError = async (
  report: ClientErrorReport,
  {userId, ip}: {userId?: string; ip: string},
  buildDir?: string
) => {
  const {level, name, message, stack, traceId, sessionId, release, ...extras} = report
  const error = new Error(message)
  error.name = name
  error.stack = await symbolicateClientStack(name, message, stack, buildDir)
  runWithLogContext(
    {
      userId,
      ip,
      sessionId,
      traceId,
      component: 'browser',
      service: CLIENT_LOG_SERVICE,
      version: release ?? 'unknown'
    },
    () => {
      Logger[level](error, {extras})
    }
  )
}

export default logClientError
