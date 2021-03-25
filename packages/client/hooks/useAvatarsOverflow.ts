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
    const avatarsCount = children.length
    const {clientWidth: parentWidth} = parentEl
    const avatarWidth = Math.ceil(avatarsWidth / avatarsCount)
    const newMaxAvatars = Math.floor(parentWidth / avatarWidth) - 1
    if (newMaxAvatars > maxAvatars) {
      setMaxAvatars(newMaxAvatars)
    } else if (avatarsWidth < scrollWidth) {
      const newMaxAvatars = Math.floor(avatarsWidth / avatarWidth) - 1
      setMaxAvatars(Math.max(newMaxAvatars, 1))
    }
  }
  useLayoutEffect(checkOverflow, [])
  useResizeObserver(checkOverflow, parentRef)
  return maxAvatars
}

export default useAvatarsOverflow
