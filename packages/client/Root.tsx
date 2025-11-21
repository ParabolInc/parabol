import * as Tooltip from '@radix-ui/react-tooltip'
import {generateHTML, generateJSON} from '@tiptap/core'
import {BrowserRouter as Router} from 'react-router-dom'
import Action from './components/Action/Action'
import AtmosphereProvider from './components/AtmosphereProvider/AtmosphereProvider'
import {TipTapProvider} from './components/TipTapProvider'
import {serverTipTapExtensions} from './shared/tiptap/serverTipTapExtensions'
import './styles/theme/global.css'
import {IsAuthenticatedProvider} from './components/IsAuthenticatedProvider'
export default function Root() {
  return (
    <AtmosphereProvider>
      <IsAuthenticatedProvider>
        <Router>
          <Tooltip.Provider>
            <TipTapProvider
              generateHTML={generateHTML}
              generateJSON={generateJSON}
              extensions={serverTipTapExtensions}
            >
              <Action />
            </TipTapProvider>
          </Tooltip.Provider>
        </Router>
      </IsAuthenticatedProvider>
    </AtmosphereProvider>
  )
}
