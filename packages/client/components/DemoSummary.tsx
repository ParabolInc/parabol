import useCanonical from '~/hooks/useCanonical'
import React, {useEffect} from 'react'
import NewMeetingSummaryRoot from '../modules/summary/components/NewMeetingSummaryRoot'
import AtmosphereProvider from './AtmosphereProvider/AtmosphereProvider'
import {MutableRecordSource} from 'relay-runtime/lib/store/RelayStoreTypes'

const getLocalAtmosphere = () => {
  return import(/* webpackChunkName: 'LocalAtmosphere' */ '~/modules/demo/LocalAtmosphere')
}

async function clearLocalAtmosphere() {
  const LocalAtmosphere = await getLocalAtmosphere()
    .then((mod) => mod.default)
    .catch()
  const atmosphere = new LocalAtmosphere().getStore().getSource() as MutableRecordSource
  atmosphere.clear()
}

const DemoSummary = () => {
  useCanonical('retrospective-demo-summary')
  useEffect(() => {
    return () => {
      clearLocalAtmosphere()
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
