import {useEffect} from 'react'
import useAtmosphere from '../../hooks/useAtmosphere'
import {printPage} from '../../tiptap/extensions/pageLinkBlock/syncedBlockPrint'
import {isOSX} from '../../utils/platform'

export const usePrintShortcut = () => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'p') return
      if (!(isOSX ? event.metaKey : event.ctrlKey) || event.shiftKey || event.altKey) return
      event.preventDefault()
      if (event.repeat) return
      printPage(atmosphere)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [atmosphere])
}
