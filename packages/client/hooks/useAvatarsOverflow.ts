import {RefObject, useLayoutEffect, useState} from 'react'
import useResizeObserver from './useResizeObserver'

const useAvatarsOverflow = (
  parentRef: RefObject<HTMLDivElement>,
  avatarsRef: RefObject<HTMLDivElement>
) => {
  const [maxAvatars, setMaxAvatars] = useState(0)
  const checkOverflow = () => {
    const {current: el} = avatarsRef
    const {current: parentEl} = parentRef
    if (!el || !parentEl) return
    const {clientWidth: avatarsWidth, scrollWidth, children} = el
    const {clientWidth: parentWidth} = parentEl
    const avatarWidth = Math.ceil(scrollWidth / children.length)
    if (avatarsWidth < scrollWidth) {
      const newMaxAvatars = Math.floor(avatarsWidth / avatarWidth) - 1 // account for overflow avatar
      setMaxAvatars(Math.max(newMaxAvatars, 1))
    } else if (avatarsWidth < parentWidth) {
      const newMaxAvatars = Math.floor(parentWidth / avatarWidth) - 1
      if (newMaxAvatars !== maxAvatars) {
        setMaxAvatars(newMaxAvatars)
      }
    }
  }
  useLayoutEffect(checkOverflow, [])
  useResizeObserver(checkOverflow, parentRef)
  return maxAvatars
}

export default useAvatarsOverflow
