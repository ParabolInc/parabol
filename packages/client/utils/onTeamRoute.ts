import matchPath from '~/utils/matchPath'

const onTeamRoute = (pathname: string, teamId: string) => {
  const res = matchPath({path: '/:teamRoute/:teamId', end: false}, pathname)
  return res && res.params.teamId === teamId
}

export default onTeamRoute
