import {matchPath} from 'react-router'

const getTeamIdFromPathname = (pathname = window.location.pathname) => {
  const teamRoute = matchPath({path: '/team/:teamId', end: false}, pathname)
  return teamRoute?.params?.teamId ?? ''
}

export default getTeamIdFromPathname
