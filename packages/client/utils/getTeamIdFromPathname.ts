import {matchPath} from 'react-router-dom'

const getTeamIdFromPathname = (pathname = window.location.pathname) => {
  const teamRoute = matchPath<{teamId: string}>(pathname, {
    path: '/team/:teamId'
  })
  return teamRoute?.params?.teamId ?? ''
}

export default getTeamIdFromPathname
