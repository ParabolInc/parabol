import describeUserAgent from './describeUserAgent'
import {CLIENT_LOG_SERVICE, normalizeErrorMessage} from './getErrorFingerprint'
import {Logger} from './Logger'
import normalizeUrlPath from './normalizeUrlPath'
import type {
  ClientErrorBreadcrumb,
  ClientErrorCause,
  ClientErrorReport
} from './parseClientErrorBatch'
import {runWithLogContext} from './requestLogContext'
import symbolicateClientStack, {symbolicateComponentStack} from './symbolicateClientStack'

// a trail of names: a route loses its ids and an error message its free text, the way a fingerprint does
const describeBreadcrumb = (breadcrumb: ClientErrorBreadcrumb): ClientErrorBreadcrumb => {
  const {type, message} = breadcrumb
  if (type === 'navigation') return {...breadcrumb, message: normalizeUrlPath(message)}
  if (type === 'error') return {...breadcrumb, message: normalizeErrorMessage(message)}
  return breadcrumb
}

const toSymbolicatedError = async (
  {name, message, stack}: ClientErrorCause,
  buildDir: string | undefined
) => {
  const error = new Error(message)
  error.name = name
  error.stack = await symbolicateClientStack(name, message, stack, buildDir)
  return error
}

const logClientError = async (
  report: ClientErrorReport,
  {userId, ip}: {userId?: string; ip: string},
  buildDir?: string
) => {
  const {
    level,
    name,
    message,
    stack,
    causes = [],
    componentStack,
    traceId,
    sessionId,
    release,
    route,
    userAgent,
    breadcrumbs,
    eventId,
    count
  } = report
  const [error, symbolicatedComponentStack, ...causeErrors] = await Promise.all([
    toSymbolicatedError({name, message, stack}, buildDir),
    componentStack ? symbolicateComponentStack(componentStack, buildDir) : undefined,
    ...causes.map((cause) => toSymbolicatedError(cause, buildDir))
  ])
  causeErrors.reduce<Error>((parent, cause) => {
    parent.cause = cause
    return cause
  }, error)
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
      Logger[level](error, {
        client: {
          ...(route && {route: normalizeUrlPath(route), rawRoute: route}),
          ...describeUserAgent(userAgent),
          ...(userAgent && {userAgent}),
          ...(symbolicatedComponentStack && {componentStack: symbolicatedComponentStack}),
          breadcrumbs: breadcrumbs.map(describeBreadcrumb),
          ...(eventId && {eventId}),
          count
        }
      })
    }
  )
}

export default logClientError
