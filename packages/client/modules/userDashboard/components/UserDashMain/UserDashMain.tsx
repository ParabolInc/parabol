import React, {lazy, Suspense} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {UserDashMainQuery} from '~/__generated__/UserDashMainQuery.graphql'
import {Route, RouteComponentProps, Switch} from 'react-router'
import DashContent from '~/components/Dashboard/DashContent'
import LoadingComponent from '../../../../components/LoadingComponent/LoadingComponent'
import StartMeetingFAB from '../../../../components/StartMeetingFAB'
import {LoaderSize} from '../../../../types/constEnums'

interface Props extends RouteComponentProps {
  queryRef: PreloadedQuery<UserDashMainQuery>
}

const UserTaskViewRoot = lazy(
  () =>
    import(/* webpackChunkName: 'MyDashboardTasksRoot' */ '../../../../components/UserTaskViewRoot')
)
const MyDashboardTimelineRoot = lazy(
  () =>
    import(
      /* webpackChunkName: 'MyDashboardTimelineRoot' */ '../../../../components/MyDashboardTimelineRoot'
    )
)

const UserDashMain = (props: Props) => {
  const {match, queryRef} = props

  const data = usePreloadedQuery<UserDashMainQuery>(
    graphql`
      query UserDashMainQuery {
        viewer {
          featureFlags {
            retrosInDisguise
          }
        }
      }
    `,
    queryRef
  )

  const {viewer} = data

  return (
    <DashContent>
      <Suspense fallback={<LoadingComponent spinnerSize={LoaderSize.PANEL} />}>
        <Switch>
          <Route path={`${match.url}/tasks`} component={UserTaskViewRoot} />
          <Route path={match.url} component={MyDashboardTimelineRoot} />
        </Switch>
      </Suspense>
      <StartMeetingFAB hasRid={viewer.featureFlags.retrosInDisguise} />
    </DashContent>
  )
}

export default UserDashMain
