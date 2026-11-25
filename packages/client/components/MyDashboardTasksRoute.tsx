import {getRouteApi} from '@tanstack/react-router'
import useDocumentTitle from '../hooks/useDocumentTitle'
import TeamArchive from '../modules/teamDashboard/components/TeamArchive/TeamArchive'
import useQueryRefLease from '../routing/useQueryRefLease'
import ErrorBoundary from './ErrorBoundary'
import MyDashboardTasksAndHeader from './MyDashboardTasksAndHeader'

const routeApi = getRouteApi(
  '/tipTapLayout/privateLayout/dashboardLayout/me/userDashMainLayout/tasks'
)

const MyDashboardTasksRoute = () => {
  const {archiveQueryRef, tasksQueryRef} = routeApi.useLoaderData()
  useQueryRefLease(archiveQueryRef)
  useQueryRefLease(tasksQueryRef)
  useDocumentTitle('Tasks | Parabol', 'Tasks')
  if (archiveQueryRef) return <TeamArchive queryRef={archiveQueryRef} />
  return (
    <ErrorBoundary>
      <MyDashboardTasksAndHeader queryRef={tasksQueryRef} />
    </ErrorBoundary>
  )
}

export default MyDashboardTasksRoute
