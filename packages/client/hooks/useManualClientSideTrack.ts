import {useCallback} from 'react'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import useAtmosphere from './useAtmosphere'

let eventId = 0

const useManualClientSideTrack = () => {
  const atmosphere = useAtmosphere()

  const trackEvent = useCallback(
    (event: string, options: Record<string, any>) => {
      SendClientSideEvent(atmosphere, event, {
        ...options,
        eventId: ++eventId
      })
    },
    [atmosphere]
  )

  return trackEvent
}

export default useManualClientSideTrack
