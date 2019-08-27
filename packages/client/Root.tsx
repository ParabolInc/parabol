import React from 'react'
import {Provider} from 'react-redux'
import {BrowserRouter as Router} from 'react-router-dom'
import AtmosphereProvider from './components/AtmosphereProvider/AtmosphereProvider'
import ActionContainer from './containers/Action/ActionContainer'

interface Props {
  store: any
}

export default function Root ({store}: Props) {
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

