import useCanonical from '~/hooks/useCanonical'
import React, {useEffect} from 'react'
import NewMeetingSummaryRoot from '../modules/summary/components/NewMeetingSummaryRoot'
import AtmosphereProvider from './AtmosphereProvider/AtmosphereProvider'
import LocalAtmosphere from '~/modules/demo/LocalAtmosphere'
import {MutableRecordSource} from 'relay-runtime/lib/store/RelayStoreTypes'

const getLocalAtmosphere = () => {
  return import(/* webpackChunkName: 'LocalAtmosphere' */ '~/modules/demo/LocalAtmosphere')
}

const DemoSummary = () => {
  useCanonical('retrospective-demo-summary')
  useEffect(() => {
    return () => {
      const localAtmosphere = new LocalAtmosphere().getStore().getSource() as MutableRecordSource
      localAtmosphere.clear()
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
