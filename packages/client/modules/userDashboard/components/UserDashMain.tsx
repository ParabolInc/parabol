import {Outlet} from '@tanstack/react-router'
import {Suspense} from 'react'
import DashContent from '~/components/Dashboard/DashContent'
import StartMeetingFAB from '~/components/StartMeetingFAB'

const UserDashMain = () => {
  return (
    <DashContent>
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
      <StartMeetingFAB />
    </DashContent>
  )
}

export default UserDashMain
