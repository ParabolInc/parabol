export type BreadcrumbType = 'operation' | 'navigation' | 'websocket' | 'error'

export interface Breadcrumb {
  time: string
  type: BreadcrumbType
  message: string
  traceId?: string
}

const MAX_BREADCRUMBS = 30
const MAX_MESSAGE_LENGTH = 200
const breadcrumbs: Breadcrumb[] = []

export const addBreadcrumb = (type: BreadcrumbType, message: string, traceId?: string) => {
  breadcrumbs.push({
    time: new Date().toISOString(),
    type,
    message: message.slice(0, MAX_MESSAGE_LENGTH),
    ...(traceId && {traceId})
  })
  if (breadcrumbs.length > MAX_BREADCRUMBS) breadcrumbs.shift()
}

export const getBreadcrumbs = () => breadcrumbs.slice()

// Reporting an error must work in the old browsers it tells to update, so this avoids findLast
export const getLastTraceId = () =>
  breadcrumbs
    .slice()
    .reverse()
    .find((breadcrumb) => breadcrumb.traceId)?.traceId
