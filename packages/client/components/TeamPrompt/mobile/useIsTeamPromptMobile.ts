import {useSyncExternalStore} from 'react'

const MOBILE_QUERY = '(max-width: 767px)'

const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

const getSnapshot = () => window.matchMedia(MOBILE_QUERY).matches

const useIsTeamPromptMobile = () => useSyncExternalStore(subscribe, getSnapshot)

export default useIsTeamPromptMobile
