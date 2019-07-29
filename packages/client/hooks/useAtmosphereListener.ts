import {useEffect} from 'react'
import {AtmosphereEvents} from '../Atmosphere'
import useAtmosphere from './useAtmosphere'

const useAtmosphereListener = <T extends keyof AtmosphereEvents, V extends AtmosphereEvents[T]>(
  eventName: T,
  callback: V extends (...args: any) => any ? V : () => V
) => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    atmosphere.eventEmitter.on(eventName, callback)
    return () => {
      atmosphere.eventEmitter.off(eventName, callback)
    }
  }, [atmosphere.eventEmitter])
}

export default useAtmosphereListener
