import React, {useEffect} from 'react'
import useCanonical from '~/hooks/useCanonical'
import NewMeetingSummaryRoot from '../modules/summary/components/NewMeetingSummaryRoot'
import AtmosphereProvider from './AtmosphereProvider/AtmosphereProvider'

const getLocalAtmosphere = () => {
  return import(/* webpackChunkName: 'LocalAtmosphere' */ '~/modules/demo/LocalAtmosphere')
}

const DemoSummary = () => {
  useCanonical('retrospective-demo-summary')
  useEffect(() => {
    return () => {
      window.localStorage.removeItem('retroDemo')
    }
  }, [])
  return (
    <AtmosphereProvider getLocalAtmosphere={getLocalAtmosphere}>
      <NewMeetingSummaryRoot />
    </AtmosphereProvider>
  )
}

export default DemoSummary
