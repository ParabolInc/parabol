import {lazy} from 'react'
import {Route, Routes} from 'react-router'
import useSubscription from '../../hooks/useSubscription'
import NotificationSubscription from '../../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../../subscriptions/OrganizationSubscription'
import TaskSubscription from '../../subscriptions/TaskSubscription'
import TeamSubscription from '../../subscriptions/TeamSubscription'

const ActivityDetailsRoute = lazy(
  () => import(/* webpackChunkName: 'ActivityDetails' */ './ActivityDetails/ActivityDetailsRoute')
)
const CreateNewActivityRoute = lazy(
  () =>
    import(
      /* webpackChunkName: 'CreateNewActivityRoute' */ './CreateNewActivity/CreateNewActivityRoute'
    )
)

const ActivityLibraryRoute = lazy(
  () => import(/* webpackChunkName: 'AcitivityLibraryRoute' */ './ActivityLibraryRoute')
)

const ActivityLibraryRoutes = () => {
  useSubscription('ActivityLibraryRoutes', NotificationSubscription)
  useSubscription('ActivityLibraryRoutes', OrganizationSubscription)
  useSubscription('ActivityLibraryRoutes', TaskSubscription)
  useSubscription('ActivityLibraryRoutes', TeamSubscription)

  return (
    <Routes>
      <Route path='new-activity/:categoryId' element={<CreateNewActivityRoute />} />
      <Route path='details/:activityId' element={<ActivityDetailsRoute />} />
      <Route path='category/:categoryId' element={<ActivityLibraryRoute />} />
      <Route index element={<ActivityLibraryRoute />} />
    </Routes>
  )
}

export default ActivityLibraryRoutes
