import {lazy} from 'react'
import {type Location, Navigate, Route, Routes, useLocation} from 'react-router-dom'
import useAuthRoute from '../hooks/useAuthRoute'
import useNoIndex from '../hooks/useNoIndex'

const Graphql = lazy(
  () =>
    import(
      /* webpackChunkName: 'GraphqlContainer' */ '../modules/admin/containers/Graphql/GraphqlContainer'
    )
)
const Impersonate = lazy(
  () =>
    import(
      /* webpackChunkName: 'ImpersonateContainer' */ '../modules/admin/containers/Impersonate/ImpersonateContainer'
    )
)
const Signout = lazy(
  () => import(/* webpackChunkName: 'SignoutContainer' */ '../containers/Signout/SignoutContainer')
)
const DashboardRoot = lazy(() => import(/* webpackChunkName: 'DashboardRoot' */ './DashboardRoot'))
const MeetingRoot = lazy(() => import(/* webpackChunkName: 'MeetingRoot' */ './MeetingRoot'))
const MeetingSeriesRoot = lazy(
  () => import(/* webpackChunkName: 'MeetingSeriesRoot' */ './MeetingSeriesRoot')
)
const ViewerNotOnTeamRoot = lazy(
  () => import(/* webpackChunkName: 'ViewerNotOnTeamRoot' */ './ViewerNotOnTeamRoot')
)

const ActivityLibraryRoutes = lazy(
  () =>
    import(
      /* webpackChunkName: 'ActivityLibraryRoutes' */ './ActivityLibrary/ActivityLibraryRoutes'
    )
)

const ReviewRequestToJoinOrgRoot = lazy(
  () => import(/* webpackChunkName: 'ReviewRequestToJoinOrgRoot' */ './ReviewRequestToJoinOrgRoot')
)

const PrivateRoutes = () => {
  useAuthRoute()
  useNoIndex()
  const location = useLocation()
  const state = location.state as {backgroundLocation?: Location} | null
  return (
    <>
      <Routes location={state?.backgroundLocation || location}>
        <Route path='/activity-library/*' element={<ActivityLibraryRoutes />} />
        <Route path='/new-meeting' element={<Navigate to='/activity-library' replace />} />
        <Route path='/meet/:meetingId' element={<MeetingRoot />} />
        <Route path='/meeting-series/:meetingId' element={<MeetingSeriesRoot />} />
        <Route path='/admin/graphql' element={<Graphql />} />
        <Route path='/admin/impersonate' element={<Impersonate />} />
        <Route path='/invitation-required' element={<ViewerNotOnTeamRoot />} />
        <Route path='/signout' element={<Signout />} />
        <Route path='*' element={<DashboardRoot />} />
      </Routes>
      <Routes>
        <Route
          path='/organization-join-request/:requestId'
          element={<ReviewRequestToJoinOrgRoot />}
        />
      </Routes>
    </>
  )
}

export default PrivateRoutes
