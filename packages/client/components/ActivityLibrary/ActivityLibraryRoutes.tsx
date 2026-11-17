import {lazy} from 'react'
import {Route, Routes} from 'react-router'

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
