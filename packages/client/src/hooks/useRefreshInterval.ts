import useForceUpdate from './useForceUpdate'
import {useEffect} from 'react'

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
