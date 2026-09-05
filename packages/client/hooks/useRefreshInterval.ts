import {useEffect} from 'react'
import useForceUpdate from './useForceUpdate'

const useRefreshInterval = (ms: number, enabled = true) => {
  const forceUpdate = useForceUpdate()
  useEffect(() => {
    if (!enabled) return
    const interval = window.setInterval(forceUpdate, ms)
    return () => {
      window.clearInterval(interval)
    }
  }, [forceUpdate, ms, enabled])
}

export default useRefreshInterval
