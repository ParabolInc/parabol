import React from 'react'
import {RouteComponentProps} from 'react-router'
import LoadingComponent from '../../../../components/LoadingComponent/LoadingComponent'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import {createRouter, JSResource, RouteRenderer, RoutingContext} from '../../../../routing'
import {LoaderSize} from '../../../../types/constEnums'
import {useUserTaskFilters} from '../../../../utils/useUserTaskFilters'
import myDashboardTasksAndHeaderQuery, {
  MyDashboardTasksAndHeaderQuery
} from '../../../../__generated__/MyDashboardTasksAndHeaderQuery.graphql'
import myDashboardTimelineQuery, {
  MyDashboardTimelineQuery
} from '../../../../__generated__/MyDashboardTimelineQuery.graphql'
import teamArchiveQuery, {
  TeamArchiveQuery
} from '../../../../__generated__/TeamArchiveQuery.graphql'

interface Props extends RouteComponentProps {}

const ArchiveTaskUserRoot = JSResource(
  'ArchiveTaskUserRoot',
  () => import('../../../../components/ArchiveTaskUserRoot')
)
const MyDashboardTasksAndHeader = JSResource(
  'MyDashboardTasksAndHeader',
  () => import('../../../../components/MyDashboardTasksAndHeader')
)
const MyDashboardTimeline = JSResource(
  'MyDashboardTimeline',
  () => import('../../../../components/MyDashboardTimeline')
)

const UserDashMain = (props: Props) => {
  const {match} = props
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const timelineQueryRef = useQueryLoaderNow<MyDashboardTimelineQuery>(myDashboardTimelineQuery, {
    first: 10,
    userIds: [viewerId]
  })

  const {userIds, teamIds, showArchived} = useUserTaskFilters(atmosphere.viewerId)
  const myDashboardTasksAndHeaderQueryRef = useQueryLoaderNow<MyDashboardTasksAndHeaderQuery>(
    myDashboardTasksAndHeaderQuery,
    {userIds, teamIds}
  )
  const archivedTasksQueryRef = useQueryLoaderNow<TeamArchiveQuery>(teamArchiveQuery, {
    userIds,
    teamIds,
    first: 10
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
          prepare: () => ({queryRef: timelineQueryRef})
        },
        {
          path: `${match.url}/tasks`,
          component: showArchived ? ArchiveTaskUserRoot : MyDashboardTasksAndHeader,
          prepare: () => ({
            queryRef: showArchived ? archivedTasksQueryRef : myDashboardTasksAndHeaderQueryRef
          })
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
