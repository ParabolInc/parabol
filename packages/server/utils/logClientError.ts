import describeUserAgent from './describeUserAgent'
import {normalizeErrorMessage} from './getErrorFingerprint'
import {Logger} from './Logger'
import normalizeUrlPath from './normalizeUrlPath'
import type {ClientErrorBreadcrumb, ClientErrorReport} from './parseClientErrorBatch'
import {runWithLogContext} from './requestLogContext'
import symbolicateClientStack, {symbolicateComponentStack} from './symbolicateClientStack'

export const CLIENT_LOG_SERVICE = 'parabol-client'

// a trail of names: a route loses its ids and an error message its free text, the way a fingerprint does
const describeBreadcrumb = (breadcrumb: ClientErrorBreadcrumb): ClientErrorBreadcrumb => {
  const {type, message} = breadcrumb
  if (type === 'navigation') return {...breadcrumb, message: normalizeUrlPath(message)}
  if (type === 'error') return {...breadcrumb, message: normalizeErrorMessage(message)}
  return breadcrumb
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
  const error = new Error(message)
  error.name = name
  const [symbolicatedStack, symbolicatedComponentStack] = await Promise.all([
    symbolicateClientStack(name, message, stack, buildDir),
    componentStack ? symbolicateComponentStack(componentStack, buildDir) : undefined
  ])
  error.stack = symbolicatedStack
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
