import isTeamHealthDemoRoute from './isTeamHealthDemoRoute'

const isDemoRoute = () =>
  window.location.pathname.startsWith('/retrospective-demo') || isTeamHealthDemoRoute()

export default isDemoRoute
