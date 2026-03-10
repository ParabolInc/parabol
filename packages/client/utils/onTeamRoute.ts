import {matchPath} from 'react-router-dom'

const onTeamRoute = (pathname: string, teamId: string) => {
  const res = matchPath('/:teamRoute/:teamId', pathname)
  return res && res.params.teamId === teamId
}

export default onTeamRoute
