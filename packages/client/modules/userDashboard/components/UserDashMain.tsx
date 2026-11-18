import {Outlet} from '@tanstack/react-router'
import {Suspense} from 'react'
import DashContent from '~/components/Dashboard/DashContent'
import LoadingComponent from '~/components/LoadingComponent/LoadingComponent'
import StartMeetingFAB from '~/components/StartMeetingFAB'
import {LoaderSize} from '~/types/constEnums'

const UserDashMain = () => {
  return (
    <DashContent>
      <Suspense fallback={<LoadingComponent spinnerSize={LoaderSize.PANEL} />}>
        <Outlet />
      </Suspense>
      <StartMeetingFAB />
    </DashContent>
  )
}

export default UserDashMain
