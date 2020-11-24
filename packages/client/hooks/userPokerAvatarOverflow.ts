import {RefObject, useLayoutEffect, useState} from 'react'
import useResizeObserver from './useResizeObserver'

const usePokerAvatarOverflow = (rowRef: RefObject<HTMLDivElement>) => {
  const avatarWidth = 44
  const avatarOverlap = 10
  const [maxAvatars, setMaxAvatars] = useState(0)
  const checkOverflow = () => {
    const {current: el} = rowRef
    if (!el) return
    const {clientWidth: totalWidth} = el
    const lappedAvatarWidth = avatarWidth - avatarOverlap
    const maxAvatars = Math.floor((totalWidth - avatarWidth) / lappedAvatarWidth)
    setMaxAvatars(maxAvatars)
  }
  useLayoutEffect(checkOverflow, [])
  useResizeObserver(checkOverflow, rowRef)
  return maxAvatars
}

export default usePokerAvatarOverflow
