import {useCallback, useEffect, useMemo, useState} from 'react'
import {GQLID} from '../../../utils/GQLID'
import {providerManager} from '../../providerManager'
import {useReauthenticateOnAccess} from './useReauthenticateOnAccess'

export type SyncedBlockStatus = 'loading' | 'ready' | 'locked' | 'error'

export const SYNCED_BLOCK_LOAD_TIMEOUT_MS = 15000

export const useSyncedBlockProvider = (pageCode: number) => {
  const documentName = GQLID.toKey(pageCode, 'page')
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState<SyncedBlockStatus>('loading')
  const provider = useMemo(
    () => providerManager.get(documentName, {nested: true}),
    [documentName, attempt]
  )

  useEffect(() => {
    providerManager.register(documentName, {nested: true})
    return () => {
      providerManager.unregister(documentName)
    }
  }, [documentName, attempt])

  useEffect(() => {
    const storedFailure = providerManager.getAuthenticationFailure(documentName)
    const isLoading = !provider.synced && !storedFailure
    if (provider.synced) {
      setStatus('ready')
    } else if (storedFailure) {
      setStatus(storedFailure === 'Unauthorized' ? 'locked' : 'error')
    } else {
      setStatus('loading')
    }
    const timeoutId = isLoading
      ? setTimeout(() => setStatus('error'), SYNCED_BLOCK_LOAD_TIMEOUT_MS)
      : undefined
    const handleSynced = () => {
      clearTimeout(timeoutId)
      setStatus('ready')
    }
    const handleAuthenticationFailed = ({reason}: {reason: string}) => {
      clearTimeout(timeoutId)
      setStatus(reason === 'Unauthorized' ? 'locked' : 'error')
    }
    provider.on('synced', handleSynced)
    provider.on('authenticationFailed', handleAuthenticationFailed)
    return () => {
      clearTimeout(timeoutId)
      provider.off('synced', handleSynced)
      provider.off('authenticationFailed', handleAuthenticationFailed)
    }
  }, [provider, attempt, documentName])

  useReauthenticateOnAccess(pageCode, status === 'locked')

  const retry = useCallback(() => setAttempt((previous) => previous + 1), [])

  return {provider, status, retry}
}
