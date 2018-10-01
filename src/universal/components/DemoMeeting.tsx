import React, {Component} from 'react'
import RetroRoot from 'universal/components/RetroRoot/RetroRoot'
import AtmosphereProvider from 'universal/components/AtmosphereProvider/AtmosphereProvider'

class DemoMeeting extends Component {
  render () {
    return (
      <AtmosphereProvider isDemo>
        <RetroRoot />
      </AtmosphereProvider>
    )
  }
}

export default DemoMeeting
