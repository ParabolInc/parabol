import {useEffect} from 'react'
import useForceUpdate from './useForceUpdate'

const useRefreshInterval = (ms: number) => {
  const forceUpdate = useForceUpdate()
  useEffect(() => {
    const interval = window.setInterval(forceUpdate, ms)
    return () => {
      window.clearInterval(interval)
    }
  }, [forceUpdate, ms])
}

export default useRefreshInterval
