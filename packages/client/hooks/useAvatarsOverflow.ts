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
    const {clientWidth: avatarsWidth, children, scrollWidth} = el
    const {clientWidth: wrapperWidth} = wrapperEl
    const avatarsCount = children.length
    const avatarWidth = Math.ceil(scrollWidth / avatarsCount)
    const newMaxAvatars = Math.floor(wrapperWidth / avatarWidth) - 1
    if (newMaxAvatars > maxAvatars) {
      setMaxAvatars(newMaxAvatars)
    } else if (scrollWidth > avatarsWidth) {
      const newMaxAvatars = Math.floor(wrapperWidth / avatarWidth) - 1
      setMaxAvatars(Math.max(newMaxAvatars, 1))
    }
  }
  useLayoutEffect(checkOverflow, [])
  useResizeObserver(checkOverflow, wrapperRef)
  return maxAvatars
}

export default useAvatarsOverflow
