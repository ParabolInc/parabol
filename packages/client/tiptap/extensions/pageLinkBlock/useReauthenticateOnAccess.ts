import {useEffect} from 'react'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {
  lookupPageViewerAccess,
  subscribeToPageViewerAccess
} from '../../../hooks/usePageViewerAccess'
import {providerManager} from '../../providerManager'

export const useReauthenticateOnAccess = (pageCode: number, isLocked: boolean) => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    if (!isLocked) return
    let hasReauthenticated = false
    return subscribeToPageViewerAccess(atmosphere, pageCode, () => {
      if (hasReauthenticated || !lookupPageViewerAccess(atmosphere, pageCode)) return
      hasReauthenticated = true
      providerManager.reauthenticate(`page:${pageCode}`)
    })
  }, [atmosphere, pageCode, isLocked])
}
