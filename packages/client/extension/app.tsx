import React from 'react'
import {BrowserRouter as Router} from 'react-router-dom'
import AtmosphereProvider from '../components/AtmosphereProvider/AtmosphereProvider'
import WorkExtension from './WorkExtension'
import '../styles/theme/global.css'

const App = () => {
  return (
    <AtmosphereProvider>
      <Router>
        <WorkExtension />
      </Router>
    </AtmosphereProvider>
  )
}

export default App
