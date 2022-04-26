import {useQueryLoader} from 'react-relay'
import {JSResource} from '../routing'
import {useUserTaskFilters} from '../utils/useUserTaskFilters'
import myDashboardTasksAndHeaderQuery, {
  MyDashboardTasksAndHeaderQuery
} from '../__generated__/MyDashboardTasksAndHeaderQuery.graphql'
import teamArchiveQuery, {TeamArchiveQuery} from '../__generated__/TeamArchiveQuery.graphql'
import useAtmosphere from './useAtmosphere'

export function useTasksRoute(path: string) {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere

  const {userIds, teamIds, showArchived} = useUserTaskFilters(viewerId)
  const [tasksRef, loadTasksQuery] = useQueryLoader<MyDashboardTasksAndHeaderQuery>(
    myDashboardTasksAndHeaderQuery
  )

  const [archivedTasksQueryRef, loadArchivedTasksQuery] =
    useQueryLoader<TeamArchiveQuery>(teamArchiveQuery)

  const TasksComponent = showArchived
    ? JSResource('ArchiveTaskUserRoot', () => import('../components/ArchiveTaskUserRoot'))
    : JSResource(
        'MyDashboardTasksAndHeader',
        () => import('../components/MyDashboardTasksAndHeader')
      )
  return {
    path,
    exact: true,
    component: TasksComponent,
    prepare: () => {
      if (showArchived) {
        if (!archivedTasksQueryRef) {
          loadArchivedTasksQuery({
            userIds,
            teamIds,
            first: 10
          })
        }
        return {queryRef: archivedTasksQueryRef}
      }

      if (!tasksRef) {
        loadTasksQuery({userIds, teamIds})
      }
      return {queryRef: tasksRef}
    }
  }
}
