import {useEffect, useRef, useState} from 'react'
import AzureDevopsClientManager, {
  AzureDevopsAccounts,
  AzureDevopsError
} from '../utils/AzureDevopsClientManager'

const useAzureDevopsAccounts = (accessToken?: string) => {
  const isMountedRef = useRef(true)
  const [accounts, setAccounts] = useState<AzureDevopsAccounts[]>([])
  const [status, setStatus] = useState<null | 'loading' | 'loaded' | 'error'>(null)
  useEffect(() => {
    const manager = new AzureDevopsClientManager(accessToken || '')
    const fetchAccounts = async () => {
      let res: AzureDevopsError | AzureDevopsAccounts[]
      try {
        res = await manager.getAzureDevOpsAccounts()
      } catch (e) {
        if (isMountedRef.current) {
          setStatus('error')
        }
        return
      }
      if (isMountedRef.current) {
        if (Array.isArray(res)) {
          setStatus('loaded')
          setAccounts(res)
        } else {
          setStatus('error')
        }
      }
    }

    if (accessToken && isMountedRef.current) {
      setStatus('loading')
      fetchAccounts().catch()
    }
    return () => {
      isMountedRef.current = false
    }
  }, [accessToken])
  return {accounts, status}
}

export default useAzureDevopsAccounts
