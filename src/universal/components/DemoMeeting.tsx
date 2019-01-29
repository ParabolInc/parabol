import React, {Component} from 'react'
import Helmet from 'react-helmet'
import AtmosphereProvider from 'universal/components/AtmosphereProvider/AtmosphereProvider'
import RetroRoot from 'universal/components/RetroRoot/RetroRoot'

class DemoMeeting extends Component {
  render () {
    return (
      <AtmosphereProvider isDemo>
        <React.Fragment>
          <Helmet>
            <meta
              property='description'
              content='See how Parabol makes for effective sprint retrospectives in 3 minutes or less, no account needed. Simulated colleagues illustrate Parabol’s powerful features including multi-user grouping, rich text editing, and gorgeous meeting summaries.'
            />
          </Helmet>
          <RetroRoot />
        </React.Fragment>
      </AtmosphereProvider>
    )
  }
}

export default DemoMeeting
