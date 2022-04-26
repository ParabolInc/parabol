import React, {ReactNode} from 'react'
import DashContent from '../../../../components/Dashboard/DashContent'
import StartMeetingFAB from '../../../../components/StartMeetingFAB'

const UserDashMain = ({children}: {children: ReactNode}) => {
  return (
    <DashContent>
      {children}
      <StartMeetingFAB />
    </DashContent>
  )
}

export default UserDashMain
