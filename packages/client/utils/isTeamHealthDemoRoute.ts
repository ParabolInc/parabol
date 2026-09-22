import {TeamHealthDemo} from '../modules/demo/teamHealthDemoIds'

const isTeamHealthDemoRoute = () => window.location.pathname.startsWith(TeamHealthDemo.ROUTE)

export default isTeamHealthDemoRoute
