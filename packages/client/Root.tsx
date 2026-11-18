import * as Tooltip from '@radix-ui/react-tooltip'
import {RouterProvider} from '@tanstack/react-router'
import {StrictMode} from 'react'
import AtmosphereProvider from './components/AtmosphereProvider/AtmosphereProvider'
import './styles/theme/global.css'
import {IsAuthenticatedProvider} from './components/IsAuthenticatedProvider'
import {ThemeProvider} from './components/ThemeProvider'
import appAtmosphere from './routing/appAtmosphere'
import appRouter from './routing/appRouter'
export default function Root() {
  return (
    <StrictMode>
      <ThemeProvider>
        <AtmosphereProvider atmosphere={appAtmosphere}>
          <IsAuthenticatedProvider>
            <Tooltip.Provider>
              <RouterProvider router={appRouter} />
            </Tooltip.Provider>
          </IsAuthenticatedProvider>
        </AtmosphereProvider>
      </ThemeProvider>
    </StrictMode>
  )
}
