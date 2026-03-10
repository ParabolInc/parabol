import {matchPath} from 'react-router-dom'

const getTeamIdFromPathname = (pathname = window.location.pathname) => {
  const teamRoute = matchPath('/team/:teamId', pathname)
  return teamRoute?.params?.teamId ?? ''
}

export default getTeamIdFromPathname
