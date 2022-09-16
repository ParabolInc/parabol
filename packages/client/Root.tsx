import React from 'react'
import {BrowserRouter as Router} from 'react-router-dom'
import Action from './components/Action/Action'
import AtmosphereProvider from './components/AtmosphereProvider/AtmosphereProvider'

export default function Root() {
  return (
    <AtmosphereProvider>
      <Router>
        <Action />
      </Router>
    </AtmosphereProvider>
  )
}
