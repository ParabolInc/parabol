import {DependencyList, useEffect} from 'react'
import {commitLocalUpdate, StoreUpdater} from 'relay-runtime'
import useAtmosphere from './useAtmosphere'

const useInitialLocalState = (updater: StoreUpdater, deps: DependencyList = []) => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    commitLocalUpdate(atmosphere, updater)
  }, deps)
}

export default useInitialLocalState
