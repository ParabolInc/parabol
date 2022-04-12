import * as React from 'react'
import DashContent from '~/components/Dashboard/DashContent'
import StartMeetingFAB from '../../../../components/StartMeetingFAB'

function DashContentRoot({children}) {
  return (
    <DashContent>
      {children}
      <StartMeetingFAB />
    </DashContent>
  )
}

export default DashContentRoot
