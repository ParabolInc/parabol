import {matchPath} from 'react-router-dom'

const onTeamRoute = (pathname: string, teamId: string) => {
  const res = matchPath<{teamId: string}>(pathname, {
    path: '/:teamRoute/:teamId'
  })
  return res && res.params.teamId === teamId
}

export default onTeamRoute
