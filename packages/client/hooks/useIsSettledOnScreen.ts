import {useEffect, useState} from 'react'
import useIsVisible from './useIsVisible'

// An element only counts once it stays on screen, so a list scrolled past doesn't trigger every item
const useIsSettledOnScreen = (element: HTMLElement | null, settleMs: number) => {
  const isVisible = useIsVisible(element, 0)
  const [isSettled, setIsSettled] = useState(false)
  useEffect(() => {
    if (!isVisible) {
      setIsSettled(false)
      return
    }
    const timer = window.setTimeout(() => {
      setIsSettled(true)
    }, settleMs)
    return () => {
      window.clearTimeout(timer)
    }
  }, [isVisible, settleMs])
  return isVisible && isSettled
}

export default useIsSettledOnScreen
