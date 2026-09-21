import {TeamHealthDemo} from '../modules/demo/teamHealthDemoIds'

const isDemoRoute = () => {
  const {pathname} = window.location
  return pathname.startsWith('/retrospective-demo') || pathname.startsWith(TeamHealthDemo.ROUTE)
}

export default isDemoRoute
