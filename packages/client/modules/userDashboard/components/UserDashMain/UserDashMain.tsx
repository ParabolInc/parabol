import React from 'react'
import {RouteComponentProps} from 'react-router'
import LoadingComponent from '../../../../components/LoadingComponent/LoadingComponent'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import {createRouter, JSResource, RouteRenderer, RoutingContext} from '../../../../routing'
import {LoaderSize} from '../../../../types/constEnums'
import myDashboardTimelineQuery, {
  MyDashboardTimelineQuery
} from '../../../../__generated__/MyDashboardTimelineQuery.graphql'

interface Props extends RouteComponentProps {}

const UserTaskViewRoot = JSResource(
  'MyDashboardTasksRoot',
  () => import('../../../../components/UserTaskViewRoot')
)
const MyDashboardTimeline = JSResource(
  'MyDashboardTimeline',
  () => import('../../../../components/MyDashboardTimeline')
)

const UserDashMain = (props: Props) => {
  const {match} = props
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const queryRef = useQueryLoaderNow<MyDashboardTimelineQuery>(myDashboardTimelineQuery, {
    first: 10,
    userIds: [viewerId]
  })
  const router = createRouter([
    {
      component: JSResource('DashContentRoot', () => import('./DashContentRoot')),
      prepare: () => ({}),
      routes: [
        {
          path: match.url,
          exact: true,
          component: MyDashboardTimeline,
          prepare: () => ({queryRef})
        },
        {
          path: `${match.url}/tasks`,
          component: UserTaskViewRoot,
          prepare: () => ({tasksQuery: queryRef})
        }
      ]
    }
  ])

  return (
    <RoutingContext.Provider value={router.context}>
      {/* Render the active route */}
      <RouteRenderer fallbackLoader={<LoadingComponent spinnerSize={LoaderSize.PANEL} />} />
    </RoutingContext.Provider>
  )
}

export default UserDashMain
