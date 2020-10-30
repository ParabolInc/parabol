
import {RefObject, useEffect} from 'react'

const usePokerZIndexOverride = (delay: number, cardRef: RefObject<HTMLDivElement>, isExpanding: boolean, collapseDuration: number) => {
  useEffect(() => {
    if (delay === 0) return
    const el = cardRef.current
    if (!el) return
    const {style} = el

    if (isExpanding) {
      style.zIndex = '1'
      setTimeout(() => {
        style.zIndex = ''
      }, delay)
    } else {
      setTimeout(() => {
        style.zIndex = '1'
        setTimeout(() => {
          style.zIndex = ''
        }, collapseDuration)
      }, delay)
    }
  }, [delay])
}

export default usePokerZIndexOverride
