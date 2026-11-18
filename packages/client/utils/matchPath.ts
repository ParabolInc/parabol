interface PathPattern {
  path: string
  end?: boolean
}

export interface PathMatch {
  params: Record<string, string>
  pathname: string
}

// Matches a pathname against a pattern like `/team/:teamId` or `/meet/:meetingId/*`, for code that runs outside the router
const matchPath = (pattern: string | PathPattern, pathname: string): PathMatch | null => {
  const {path, end = true} = typeof pattern === 'string' ? {path: pattern} : pattern
  const patternSegments = path.split('/').filter(Boolean)
  const pathSegments = pathname.split('/').filter(Boolean)
  const params: Record<string, string> = {}
  for (let index = 0; index < patternSegments.length; index++) {
    const segment = patternSegments[index]!
    if (segment === '*') {
      params['*'] = pathSegments.slice(index).map(decodeURIComponent).join('/')
      return {params, pathname}
    }
    const value = pathSegments[index]
    if (value === undefined) return null
    if (segment.startsWith(':')) params[segment.slice(1)] = decodeURIComponent(value)
    else if (segment.toLowerCase() !== value.toLowerCase()) return null
  }
  if (end && pathSegments.length > patternSegments.length) return null
  return {params, pathname: `/${pathSegments.slice(0, patternSegments.length).join('/')}`}
}

export default matchPath
