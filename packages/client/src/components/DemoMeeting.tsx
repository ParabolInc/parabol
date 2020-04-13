import React from 'react'
import AtmosphereProvider from './AtmosphereProvider/AtmosphereProvider'
import useMetaTagContent from '../hooks/useMetaTagContent'
import DemoMeetingRoot from './DemoMeetingRoot'
import useCanonical from '~/hooks/useCanonical'

const CONTENT =
  'Parabol offers effective sprint retrospectives for free. Try a 2-minute demo, no account needed. Simulated colleagues illustrate Parabol’s powerful features including multi-user grouping, rich text editing, and gorgeous meeting summaries.'

const DemoMeeting = () => {
  useMetaTagContent(CONTENT)
  useCanonical('retrospective-demo')
  return (
    <AtmosphereProvider isDemo>
      <DemoMeetingRoot />
    </AtmosphereProvider>
  )
}

export default DemoMeeting
