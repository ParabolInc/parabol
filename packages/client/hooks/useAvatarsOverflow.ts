import {RefObject, useLayoutEffect, useState} from 'react'
import useResizeObserver from './useResizeObserver'

const useAvatarsOverflow = (
  wrapperRef: RefObject<HTMLDivElement>,
  avatarsRef: RefObject<HTMLDivElement>
) => {
  const [maxAvatars, setMaxAvatars] = useState(0)
  const checkOverflow = () => {
    const {current: el} = avatarsRef
    const {current: wrapperEl} = wrapperRef
    if (!el || !wrapperEl) return
    const {clientWidth: avatarsWidth, children} = el
    const avatarsCount = children.length
    const {clientWidth: parentWidth} = wrapperEl
    const avatarWidth = Math.ceil(avatarsWidth / avatarsCount)
    const newMaxAvatars = Math.floor(parentWidth / avatarWidth) - 1
    if (avatarsWidth > parentWidth) {
      const newMaxAvatars = Math.floor(parentWidth / avatarWidth) - 1
      setMaxAvatars(Math.max(newMaxAvatars, 1))
    } else if (newMaxAvatars > maxAvatars) {
      setMaxAvatars(newMaxAvatars)
    }
  }
  useLayoutEffect(checkOverflow, [])
  useResizeObserver(checkOverflow, wrapperRef)
  return maxAvatars
}

export default useAvatarsOverflow
