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
              name='description'
              content='Try Parabol without creating an account; a free online retrospective tool featuring custom templates, powerful analytics, multi-user grouping, rich text editing, integrations, and gorgeous meeting summaries. Tasks are assigned and tracked so your team can continuously improve.'
            />
          </Helmet>
          <RetroRoot />
        </React.Fragment>
      </AtmosphereProvider>
    )
  }
}

export default DemoMeeting
