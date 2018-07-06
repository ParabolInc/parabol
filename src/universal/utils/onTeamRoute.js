import {matchPath} from 'react-router-dom'

const onTeamRoute = (pathname, teamId) => {
  const res = matchPath(pathname, {
    path: '/:teamRoute/:teamId'
  })
  return res && res.params.teamId === teamId
}

export default onTeamRoute
