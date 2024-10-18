import {useCallback} from 'react'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import useAtmosphere from './useAtmosphere'

const useManualClientSideTrack = () => {
  const atmosphere = useAtmosphere()

  const trackEvent = useCallback(
    (event: string, options: Record<string, any>) => {
      SendClientSideEvent(atmosphere, event, {
        ...options
      })
    },
    [atmosphere]
  )

  return trackEvent
}

export default useManualClientSideTrack
