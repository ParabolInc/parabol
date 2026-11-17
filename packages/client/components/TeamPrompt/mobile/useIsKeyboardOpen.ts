import {useEffect, useState} from 'react'

const KEYBOARD_MIN_HEIGHT = 150

const useIsKeyboardOpen = () => {
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    let width = viewport.width
    let tallestHeight = viewport.height
    const update = () => {
      if (viewport.width !== width) {
        width = viewport.width
        tallestHeight = viewport.height
      }
      tallestHeight = Math.max(tallestHeight, viewport.height)
      setIsOpen(tallestHeight - viewport.height > KEYBOARD_MIN_HEIGHT)
    }
    viewport.addEventListener('resize', update)
    return () => viewport.removeEventListener('resize', update)
  }, [])
  return isOpen
}

export default useIsKeyboardOpen
