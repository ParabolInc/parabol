import {useEffect} from 'react'
import type {AtmosphereEvents} from '../Atmosphere'
import useAtmosphere from './useAtmosphere'
import useEventCallback from './useEventCallback'

const useAtmosphereListener = <T extends keyof AtmosphereEvents, V extends AtmosphereEvents[T]>(
  eventName: T,
  callback: V extends (...args: any) => any ? V : () => V
) => {
  const atmosphere = useAtmosphere()
  const cb = useEventCallback(callback)
  useEffect(() => {
    atmosphere.eventEmitter.on(eventName as any, cb)
    return () => {
      atmosphere.eventEmitter.off(eventName, cb)
    }
  }, [atmosphere.eventEmitter, eventName, cb])
}

export default useAtmosphereListener
