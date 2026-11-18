import {useEffect} from 'react'
import useAtmosphere from './useAtmosphere'

export const useOpenSidebarForPagesTrash = (isOpen: boolean, toggle: () => void) => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    if (isOpen) return
    atmosphere.eventEmitter.on('openPagesTrash', toggle)
    return () => {
      atmosphere.eventEmitter.off('openPagesTrash', toggle)
    }
  }, [atmosphere, isOpen, toggle])
}
