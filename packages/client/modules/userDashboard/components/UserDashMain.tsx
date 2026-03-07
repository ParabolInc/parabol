import {lazy, Suspense} from 'react'
import {Route, Switch, useRouteMatch} from 'react-router'
import DashContent from '~/components/Dashboard/DashContent'
import LoadingComponent from '~/components/LoadingComponent/LoadingComponent'
import StartMeetingFAB from '~/components/StartMeetingFAB'
import {LoaderSize} from '~/types/constEnums'

const UserTaskViewRoot = lazy(
  () =>
    import(/* webpackChunkName: 'MyDashboardTasksRoot' */ '../../../components/UserTaskViewRoot')
)
const MyDashboardTimelineRoot = lazy(
  () =>
    import(
      /* webpackChunkName: 'MyDashboardTimelineRoot' */ '../../../components/MyDashboardTimelineRoot'
    )
)

const UserDashMain = () => {
  const {url} = useRouteMatch()

  return (
    <DashContent>
      <Suspense fallback={<LoadingComponent spinnerSize={LoaderSize.PANEL} />}>
        <Switch>
          <Route path={`${url}/tasks`} component={UserTaskViewRoot} />
          <Route path={url} component={MyDashboardTimelineRoot} />
        </Switch>
      </Suspense>
      <StartMeetingFAB />
    </DashContent>
  )
}

export default UserDashMain
