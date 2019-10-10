import React, {Component} from 'react'
import AtmosphereProvider from './AtmosphereProvider/AtmosphereProvider'
import NewMeetingSummaryRoot from '../modules/summary/components/NewMeetingSummaryRoot'

class DemoSummary extends Component {
  componentWillUnmount() {
    window.localStorage.removeItem('retroDemo')
  }
  render() {
    return (
      <AtmosphereProvider isDemo>
        <NewMeetingSummaryRoot />
      </AtmosphereProvider>
    )
  }
}

export default DemoSummary
