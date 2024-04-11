import {useEffect, useRef} from 'react'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import useAtmosphere from './useAtmosphere'

// certain users keep sending this non-stop. not sure why.
// include an eventId so we know if it's the component. if it's not here, then in must be in trebuchet
let eventId = 0
const useClientSideTrack = (event: string, options: Record<string, any>) => {
  const initialOptionsRef = useRef(options)
  const atmosphere = useAtmosphere()
  useEffect(() => {
    SendClientSideEvent(atmosphere, event, {
      ...initialOptionsRef.current,
      eventId: ++eventId
    })
  }, [atmosphere, event, initialOptionsRef])
}

export default useClientSideTrack
