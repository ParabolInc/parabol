import PropTypes from 'prop-types'
import React from 'react'
import {Provider} from 'react-redux'
import {BrowserRouter as Router} from 'react-router-dom'
import AtmosphereProvider from './components/AtmosphereProvider/AtmosphereProvider'
import ActionContainer from './containers/Action/ActionContainer'

export default function Root ({store}) {
  return (
    <Provider store={store}>
      <AtmosphereProvider>
        <Router>
          <ActionContainer />
        </Router>
      </AtmosphereProvider>
    </Provider>
  )
}

Root.propTypes = {
  store: PropTypes.object.isRequired
}
