// In-bundle preview provider for the Parabol design-sync bundle. It MUST be
// bundled into _ds_bundle.js (via cfg.extraEntries) so it shares the exact
// react-router / radix-tooltip / react-relay module instances the components
// read from — an externally-imported provider is a different copy with a
// mismatched context and does nothing.
//
// Wired via cfg.provider = { component: 'DesignSyncProvider' }. The card HTML
// wraps every rendered story in this.
import * as React from 'react'
import {MemoryRouter} from 'react-router'
import * as Tooltip from '@radix-ui/react-tooltip'
import {RelayEnvironmentProvider} from 'react-relay'
import {Environment, Network, RecordSource, Store} from 'relay-runtime'

// A minimal, never-resolving relay environment. Components that only need
// `useRelayEnvironment()` to be non-null (e.g. useAtmosphere = useRelayEnvironment)
// render; actual queries/fragments stay empty (static preview never fetches).
const environment = new Environment({
  network: Network.create(() => Promise.resolve({data: {}})),
  store: new Store(new RecordSource())
})

export const DesignSyncProvider = ({children}: {children: React.ReactNode}) => (
  <RelayEnvironmentProvider environment={environment}>
    <MemoryRouter>
      <Tooltip.Provider>{children}</Tooltip.Provider>
    </MemoryRouter>
  </RelayEnvironmentProvider>
)

export default DesignSyncProvider
