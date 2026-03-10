import {lazy, Suspense} from 'react'
import {Route, Routes} from 'react-router-dom'
import DashContent from '~/components/Dashboard/DashContent'
import LoadingComponent from '~/components/LoadingComponent/LoadingComponent'
import StartMeetingFAB from '~/components/StartMeetingFAB'
import {LoaderSize} from '~/types/constEnums'

const UserTaskViewRoot = lazy(
  () =>
    import(/* webpackChunkName: 'MyDashboardTasksRoot' */ '../../../components/UserTaskViewRoot')
)
const MyDashboardTimelineRoot = lazy(
  () =>
    import(
      /* webpackChunkName: 'MyDashboardTimelineRoot' */ '../../../components/MyDashboardTimelineRoot'
    )
)

const UserDashMain = () => {
  return (
    <DashContent>
      <Suspense fallback={<LoadingComponent spinnerSize={LoaderSize.PANEL} />}>
        <Routes>
          <Route path='tasks' element={<UserTaskViewRoot />} />
          <Route path='*' element={<MyDashboardTimelineRoot />} />
        </Routes>
      </Suspense>
      <StartMeetingFAB />
    </DashContent>
  )
}

export default UserDashMain
