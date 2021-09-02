import {useEffect, useRef, useState} from 'react'
import {Unpromise} from '../types/generics'
import AtlassianClientManager from '../utils/AtlassianClientManager'
import {AccessibleResource} from '../utils/AtlassianManager'

const useAtlassianSites = (accessToken?: string) => {
  const isMountedRef = useRef(true)
  const [sites, setSites] = useState<AccessibleResource[]>([])
  const [status, setStatus] = useState<null | 'loading' | 'loaded' | 'error'>(null)
  useEffect(() => {
    const manager = new AtlassianClientManager(accessToken || '')
    const fetchSites = async () => {
      let res: Unpromise<ReturnType<typeof manager.getAccessibleResources>>
      try {
        res = await manager.getAccessibleResources()
      } catch (e) {
        if (isMountedRef.current) {
          setStatus('error')
        }
        return
      }
      if (isMountedRef.current) {
        if (Array.isArray(res)) {
          setStatus('loaded')
          setSites(res)
        } else {
          setStatus('error')
        }
      }
    }

    if (accessToken && isMountedRef.current) {
      setStatus('loading')
      fetchSites().catch()
    }
    return () => {
      isMountedRef.current = false
    }
  }, [accessToken])
  return {sites, status}
}

export default useAtlassianSites
