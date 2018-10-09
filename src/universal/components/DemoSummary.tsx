import React, {Component} from 'react'
import AtmosphereProvider from 'universal/components/AtmosphereProvider/AtmosphereProvider'
import NewMeetingSummaryRoot from 'universal/modules/summary/components/NewMeetingSummaryRoot'

class DemoSummary extends Component {
  componentWillUnmount () {
    window.localStorage.removeItem('retroDemo')
  }
  render () {
    console.log('sum')
    return (
      <AtmosphereProvider isDemo>
        <NewMeetingSummaryRoot />
      </AtmosphereProvider>
    )
  }
}

export default DemoSummary
