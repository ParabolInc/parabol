import {useEffect, useState} from 'react'
import AtlassianClientManager, {
  AccessibleResource,
  AtlassianError
} from '../utils/AtlassianClientManager'

const useAtlassianSites = (accessToken?: string) => {
  let isMounted = true
  const manager = new AtlassianClientManager(accessToken || '')
  const [sites, setSites] = useState<AccessibleResource[]>([])
  const [status, setStatus] = useState<null | 'loading' | 'loaded' | 'error'>(null)
  useEffect(() => {
    const fetchSites = async () => {
      let res: AtlassianError | AccessibleResource[]
      try {
        res = await manager.getAccessibleResources()
      } catch (e) {
        if (isMounted) {
          setStatus('error')
        }
        return
      }
      if (isMounted) {
        if (Array.isArray(res)) {
          setStatus('loaded')
          setSites(res)
        } else {
          setStatus('error')
        }
      }
    }

    if (accessToken && isMounted) {
      setStatus('loading')
      fetchSites().catch()
    }
    return () => {
      isMounted = false
    }
  }, [accessToken])
  return {sites, status}
}

export default useAtlassianSites
