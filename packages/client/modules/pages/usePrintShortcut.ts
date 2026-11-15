import {useEffect} from 'react'
import useAtmosphere from '../../hooks/useAtmosphere'
import {printPage} from '../../tiptap/extensions/pageLinkBlock/syncedBlockPrint'

export const usePrintShortcut = () => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'p') return
      if (!(event.metaKey || event.ctrlKey) || event.shiftKey || event.altKey) return
      event.preventDefault()
      printPage(atmosphere)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [atmosphere])
}
