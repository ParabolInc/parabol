import useCanonical from '~/hooks/useCanonical'
import useMetaTagContent from '../hooks/useMetaTagContent'
import AtmosphereProvider from './AtmosphereProvider/AtmosphereProvider'
import DemoMeetingRoot from './DemoMeetingRoot'

const CONTENT =
  'Parabol offers effective sprint retrospectives for free. Try a 2-minute demo, no account needed. Simulated colleagues illustrate Parabol’s powerful features including multi-user grouping, rich text editing, and gorgeous meeting summaries. Pair it with an anonymous team health check to track engagement and psychological safety.'

const getLocalAtmosphere = () => {
  return import(/* webpackChunkName: 'LocalAtmosphere' */ '~/modules/demo/LocalAtmosphere')
}

const DemoMeeting = () => {
  useMetaTagContent(CONTENT)
  useCanonical('retrospective-demo')
  return (
    <AtmosphereProvider getLocalAtmosphere={getLocalAtmosphere}>
      <DemoMeetingRoot />
    </AtmosphereProvider>
  )
}

export default DemoMeeting
