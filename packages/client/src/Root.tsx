import React from 'react'
import {BrowserRouter as Router} from 'react-router-dom'
import AtmosphereProvider from './components/AtmosphereProvider/AtmosphereProvider'
import Action from './components/Action/Action'

export default function Root() {
  return (
    <AtmosphereProvider>
      <Router>
        <Action />
      </Router>
    </AtmosphereProvider>
  )
}
