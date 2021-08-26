import React, {lazy, Suspense} from 'react'
import {Route, RouteComponentProps, Switch} from 'react-router'
import DashContent from '~/components/Dashboard/DashContent'
import LoadingComponent from '../../../../components/LoadingComponent/LoadingComponent'
import StartMeetingFAB from '../../../../components/StartMeetingFAB'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {Breakpoint, LoaderSize} from '../../../../types/constEnums'
import StaticStartMeetingFAB from '../../../../components/StaticStartMeetingFAB'

interface Props extends RouteComponentProps {}

const UserTaskViewRoot = lazy(() =>
  import(/* webpackChunkName: 'MyDashboardTasksRoot' */ '../../../../components/UserTaskViewRoot')
)
const MyDashboardTimelineRoot = lazy(() =>
  import(
    /* webpackChunkName: 'MyDashboardTimelineRoot' */ '../../../../components/MyDashboardTimelineRoot'
  )
)

const UserDashMain = (props: Props) => {
  const {match} = props
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  return (
    <>
      <DashContent>
        <Suspense fallback={<LoadingComponent spinnerSize={LoaderSize.PANEL} />}>
          <Switch>
            <Route path={`${match.url}/tasks`} component={UserTaskViewRoot} />
            <Route path={match.url} component={MyDashboardTimelineRoot} />
          </Switch>
        </Suspense>
      </DashContent>
      {isDesktop ? <StaticStartMeetingFAB /> : <StartMeetingFAB />}
    </>
  )
}

export default UserDashMain
