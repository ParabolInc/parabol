import {matchPath} from 'react-router'
import {REPORTED_ROUTES, type ReportedRoute} from '../shared/reportedRoutes'

// The key changes when the route or one of its params does, but not on a meeting's stage change or a search change
const matchReportedRoute = (pathname: string): {route: ReportedRoute | null; key: string} => {
  for (const route of REPORTED_ROUTES) {
    const match = matchPath(route, pathname)
    if (!match) continue
    const params = Object.entries(match.params).filter(([name]) => name !== '*')
    return {route, key: `${route}${JSON.stringify(params)}`}
  }
  return {route: null, key: pathname}
}

export default matchReportedRoute
