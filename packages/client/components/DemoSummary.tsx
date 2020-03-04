import useCanonical from 'hooks/useCanonical'
import React, {useEffect} from 'react'
import NewMeetingSummaryRoot from '../modules/summary/components/NewMeetingSummaryRoot'
import AtmosphereProvider from './AtmosphereProvider/AtmosphereProvider'

const DemoSummary = () => {
  useCanonical('retrospective-demo-summary')
  useEffect(() => {
    return () => {
      window.localStorage.removeItem('retroDemo')
    }
  }, [])
  return (
    <AtmosphereProvider isDemo>
      <NewMeetingSummaryRoot />
    </AtmosphereProvider>
  )
}

export default DemoSummary
