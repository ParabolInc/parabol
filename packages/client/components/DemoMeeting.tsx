import React from 'react'
import AtmosphereProvider from './AtmosphereProvider/AtmosphereProvider'
import RetroRoot from './RetroRoot/RetroRoot'
import useMetaTagContent from '../hooks/useMetaTagContent'

const CONTENT =
  'Parabol offers effective sprint retrospectives for free. Try a 2-minute demo, no account needed. Simulated colleagues illustrate Parabol’s powerful features including multi-user grouping, rich text editing, and gorgeous meeting summaries.'

const DemoMeeting = () => {
  useMetaTagContent(CONTENT)
  return (
    <AtmosphereProvider isDemo>
      <RetroRoot />
    </AtmosphereProvider>
  )
}

export default DemoMeeting
