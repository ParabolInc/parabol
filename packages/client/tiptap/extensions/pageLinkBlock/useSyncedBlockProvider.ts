import {useCallback, useEffect, useMemo, useState} from 'react'
import {providerManager} from '../../providerManager'

export type SyncedBlockStatus = 'loading' | 'ready' | 'locked' | 'error'

export const SYNCED_BLOCK_LOAD_TIMEOUT_MS = 15000

export const useSyncedBlockProvider = (pageCode: number) => {
  const documentName = `page:${pageCode}`
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState<SyncedBlockStatus>('loading')
  const provider = useMemo(() => providerManager.get(documentName), [documentName, attempt])

  useEffect(() => {
    providerManager.register(documentName)
    return () => {
      providerManager.unregister(documentName)
    }
  }, [documentName, attempt])

  useEffect(() => {
    if (provider.synced) {
      setStatus('ready')
      return
    }
    setStatus('loading')
    const timeoutId = setTimeout(() => setStatus('error'), SYNCED_BLOCK_LOAD_TIMEOUT_MS)
    const handleSynced = () => {
      clearTimeout(timeoutId)
      setStatus('ready')
    }
    const handleAuthenticationFailed = ({reason}: {reason: string}) => {
      if (reason !== 'Unauthorized') return
      clearTimeout(timeoutId)
      setStatus('locked')
    }
    provider.on('synced', handleSynced)
    provider.on('authenticationFailed', handleAuthenticationFailed)
    return () => {
      clearTimeout(timeoutId)
      provider.off('synced', handleSynced)
      provider.off('authenticationFailed', handleAuthenticationFailed)
    }
  }, [provider, attempt])

  const retry = useCallback(() => setAttempt((previous) => previous + 1), [])

  return {provider, status, retry}
}
