import * as Tooltip from '@radix-ui/react-tooltip'
import {StrictMode} from 'react'
import {BrowserRouter as Router} from 'react-router'

import Action from './components/Action/Action'
import AtmosphereProvider from './components/AtmosphereProvider/AtmosphereProvider'
import './styles/theme/global.css'
import {IsAuthenticatedProvider} from './components/IsAuthenticatedProvider'
import {ThemeProvider} from './components/ThemeProvider'
export default function Root() {
  return (
    <StrictMode>
      <ThemeProvider>
        <AtmosphereProvider>
          <IsAuthenticatedProvider>
            <Router>
              <Tooltip.Provider>
                <Action />
              </Tooltip.Provider>
            </Router>
          </IsAuthenticatedProvider>
        </AtmosphereProvider>
      </ThemeProvider>
    </StrictMode>
  )
}
