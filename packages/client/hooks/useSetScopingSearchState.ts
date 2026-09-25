import {useCallback} from 'react'
import {commitLocalUpdate} from 'react-relay'
import type {RegisteredClientIntegration} from '~/integrations/platform/registry'
import type {ScopingSearchState} from '~/integrations/platform/ScopingSearchState'
import setScopingSearchStateInRelayStore from '~/utils/relay/setScopingSearchStateInRelayStore'
import useAtmosphere from './useAtmosphere'

const useSetScopingSearchState = (meetingId: string, service: RegisteredClientIntegration) => {
  const atmosphere = useAtmosphere()
  return useCallback(
    (patch: Partial<ScopingSearchState>) => {
      commitLocalUpdate(atmosphere, (store) => {
        setScopingSearchStateInRelayStore(store, meetingId, service, patch)
      })
    },
    [atmosphere, meetingId, service]
  )
}

export default useSetScopingSearchState
