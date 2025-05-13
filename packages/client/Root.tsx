import * as Tooltip from '@radix-ui/react-tooltip'
import {BrowserRouter as Router} from 'react-router-dom'
import Action from './components/Action/Action'
import AtmosphereProvider from './components/AtmosphereProvider/AtmosphereProvider'
import './styles/theme/global.css'

export default function Root() {
  return (
    <AtmosphereProvider>
      <Router>
        <Tooltip.Provider>
          <Action />
        </Tooltip.Provider>
      </Router>
    </AtmosphereProvider>
  )
}
