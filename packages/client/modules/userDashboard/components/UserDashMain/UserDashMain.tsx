import DashContent from 'components/Dashboard/DashContent'
import React, {lazy, Suspense} from 'react'
import {Route, RouteComponentProps, Switch} from 'react-router'
import LoadingComponent from '../../../../components/LoadingComponent/LoadingComponent'
import {LoaderSize} from '../../../../types/constEnums'

interface Props extends RouteComponentProps<{}> {}

const MyDashboardTasksRoot = lazy(() =>
  import(
    /* webpackChunkName: 'MyDashboardTasksRoot' */ '../../../../components/MyDashboardTasksRoot'
  )
)
const MyDashboardTimelineRoot = lazy(() =>
  import(
    /* webpackChunkName: 'MyDashboardTimelineRoot' */ '../../../../components/MyDashboardTimelineRoot'
  )
)

const UserDashMain = (props: Props) => {
  const {match} = props
  return (
    <DashContent>
      <Suspense fallback={<LoadingComponent spinnerSize={LoaderSize.PANEL} />}>
        <Switch>
          <Route path={`${match.url}/tasks`} component={MyDashboardTasksRoot} />
          <Route path={match.url} component={MyDashboardTimelineRoot} />
        </Switch>
      </Suspense>
    </DashContent>
  )
}

export default UserDashMain
