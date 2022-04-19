import {useQueryLoader} from 'react-relay'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {JSResource} from '../../../../routing'
import {useUserTaskFilters} from '../../../../utils/useUserTaskFilters'
import myDashboardTasksAndHeaderQuery, {
  MyDashboardTasksAndHeaderQuery
} from '../../../../__generated__/MyDashboardTasksAndHeaderQuery.graphql'
import teamArchiveQuery, {
  TeamArchiveQuery
} from '../../../../__generated__/TeamArchiveQuery.graphql'

export function useTasksRoute() {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere

  const {userIds, teamIds, showArchived} = useUserTaskFilters(viewerId)
  const [tasksRef, loadTasksQuery] = useQueryLoader<MyDashboardTasksAndHeaderQuery>(
    myDashboardTasksAndHeaderQuery
  )

  const [archivedTasksQueryRef, loadArchivedTasksQuery] =
    useQueryLoader<TeamArchiveQuery>(teamArchiveQuery)

  const TasksComponent = showArchived
    ? JSResource('ArchiveTaskUserRoot', () => import('../../../../components/ArchiveTaskUserRoot'))
    : JSResource(
        'MyDashboardTasksAndHeader',
        () => import('../../../../components/MyDashboardTasksAndHeader')
      )
  return {
    path: `/me/tasks`,
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
