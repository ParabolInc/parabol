import * as Tooltip from '@radix-ui/react-tooltip'
import {BrowserRouter as Router} from 'react-router-dom'
import Action from './components/Action/Action'
import AtmosphereProvider from './components/AtmosphereProvider/AtmosphereProvider'
import {BackgroundMusicProvider} from './components/AtmosphereProvider/BackgroundMusicProvider/BackgroundMusicProvider'
import BottomControlBarMusic from './components/BottomControlBarMusic'
import './styles/theme/global.css'

export default function Root() {
  return (
    <BackgroundMusicProvider meetingId={null} isFacilitator={true}>
      <AtmosphereProvider>
        <Router>
          <Tooltip.Provider>
            <Action />
            <BottomControlBarMusic isFacilitator={true} />
          </Tooltip.Provider>
        </Router>
      </AtmosphereProvider>
    </BackgroundMusicProvider>
  )
}
