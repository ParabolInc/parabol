import {useEffect} from 'react'
import useAtmosphere from './useAtmosphere'

const useStoreQueryRetry = (retry: () => void) => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    atmosphere.retries.add(retry)
    return () => {
      atmosphere.retries.delete(retry)
    }
  }, [retry])
}

export default useStoreQueryRetry
