import * as Tooltip from '@radix-ui/react-tooltip'
import {RouterProvider} from '@tanstack/react-router'
import {StrictMode} from 'react'
import {unstable_HistoryRouter as HistoryRouter} from 'react-router'
import AtmosphereProvider from './components/AtmosphereProvider/AtmosphereProvider'
import './styles/theme/global.css'
import {IsAuthenticatedProvider} from './components/IsAuthenticatedProvider'
import {ThemeProvider} from './components/ThemeProvider'
import appAtmosphere from './routing/appAtmosphere'
import appRouter, {reactRouterHistory} from './routing/appRouter'
export default function Root() {
  return (
    <StrictMode>
      <ThemeProvider>
        <AtmosphereProvider atmosphere={appAtmosphere}>
          <IsAuthenticatedProvider>
            <HistoryRouter history={reactRouterHistory}>
              <Tooltip.Provider>
                <RouterProvider router={appRouter} />
              </Tooltip.Provider>
            </HistoryRouter>
          </IsAuthenticatedProvider>
        </AtmosphereProvider>
      </ThemeProvider>
    </StrictMode>
  )
}
