const TOKEN_ROUTE = /^\/(verify-email|reset-password|team-invitation|invitation-link)(?:\/|$)/

const getReportedRoute = (pathname: string) => {
  const tokenRoute = pathname.match(TOKEN_ROUTE)?.[1]
  return tokenRoute ? `/${tokenRoute}/<token>` : pathname
}

export default getReportedRoute
