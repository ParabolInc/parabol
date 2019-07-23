import {useEffect} from 'react'
import {AtmosphereEvents} from 'universal/Atmosphere'
import useAtmosphere from 'universal/hooks/useAtmosphere'

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
  }, [])
}

export default useAtmosphereListener
