import PropTypes from 'prop-types'
import React from 'react'
import {Provider} from 'react-redux'
import {BrowserRouter as Router} from 'react-router-dom'
import AtmosphereProvider from 'universal/components/AtmosphereProvider/AtmosphereProvider'
import ActionContainer from 'universal/containers/Action/ActionContainer'
import {cache} from 'emotion'
import {CacheProvider} from '@emotion/core'

export default function Root ({store}) {
  return (
    <CacheProvider value={cache}>
      <Provider store={store}>
        <AtmosphereProvider>
          <Router>
            <ActionContainer />
          </Router>
        </AtmosphereProvider>
      </Provider>
    </CacheProvider>
  )
}

Root.propTypes = {
  store: PropTypes.object.isRequired
}
