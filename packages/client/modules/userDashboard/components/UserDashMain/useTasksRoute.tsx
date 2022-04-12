import {RouteComponentProps} from 'react-router'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import {JSResource} from '../../../../routing'
import {useUserTaskFilters} from '../../../../utils/useUserTaskFilters'
import myDashboardTasksAndHeaderQuery, {
  MyDashboardTasksAndHeaderQuery
} from '../../../../__generated__/MyDashboardTasksAndHeaderQuery.graphql'
import teamArchiveQuery, {
  TeamArchiveQuery
} from '../../../../__generated__/TeamArchiveQuery.graphql'

export function useTasksRoute(match: RouteComponentProps['match']) {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere

  const {userIds, teamIds, showArchived} = useUserTaskFilters(viewerId)
  const myDashboardTasksAndHeaderQueryRef = useQueryLoaderNow<MyDashboardTasksAndHeaderQuery>(
    myDashboardTasksAndHeaderQuery,
    {userIds, teamIds}
  )
  const archivedTasksQueryRef = useQueryLoaderNow<TeamArchiveQuery>(teamArchiveQuery, {
    userIds,
    teamIds,
    first: 10
  })
  const tasksQueryRef = showArchived ? archivedTasksQueryRef : myDashboardTasksAndHeaderQueryRef

  const TasksComponent = showArchived
    ? JSResource('ArchiveTaskUserRoot', () => import('../../../../components/ArchiveTaskUserRoot'))
    : JSResource(
        'MyDashboardTasksAndHeader',
        () => import('../../../../components/MyDashboardTasksAndHeader')
      )
  return {
    path: `${match.url}/tasks`,
    component: TasksComponent,
    prepare: () => ({queryRef: tasksQueryRef})
  }
}
