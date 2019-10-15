import React, {lazy, Suspense} from 'react'
import styled from '@emotion/styled'
import {matchPath, Route, RouteComponentProps, Switch, withRouter} from 'react-router'
import DashHeader from '../../../../components/Dashboard/DashHeader'
import Tab from '../../../../components/Tab/Tab'
import Tabs from '../../../../components/Tabs/Tabs'
import LoadingComponent from '../../../../components/LoadingComponent/LoadingComponent'
import {LoaderSize} from '../../../../types/constEnums'
import DashContent from 'components/Dashboard/DashContent'
import useDocumentTitle from '../../../../hooks/useDocumentTitle'

const TopTabs = styled(Tabs)({
  marginTop: 12
})

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
  const {history, match} = props
  const isTasks = !!matchPath(location.pathname, {path: `${match.url}/tasks`})
  useDocumentTitle('My Dashboard | Parabol')
  return (
    <>
      <DashHeader>
        <TopTabs activeIdx={isTasks ? 1 : 0}>
          <Tab label='TIMELINE' onClick={() => history.push('/me')} />
          <Tab label='TASKS' onClick={() => history.push('/me/tasks')} />
        </TopTabs>
      </DashHeader>
      <DashContent>
        <Suspense fallback={<LoadingComponent spinnerSize={LoaderSize.PANEL} />}>
          <Switch>
            <Route path={`${match.url}/tasks`} component={MyDashboardTasksRoot} />
            <Route path={match.url} component={MyDashboardTimelineRoot} />
          </Switch>
        </Suspense>
      </DashContent>
    </>
  )
}

export default withRouter(UserDashMain)
