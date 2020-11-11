import {RefObject, useLayoutEffect, useState} from 'react'
import useResizeObserver from './useResizeObserver'

const usePokerAvatarOverflow = (rowRef: RefObject<HTMLDivElement>, totalAvatars: number) => {
  const avatarWidth = 44
  const avatarOverlap = 10
  const [overflowCount, setOverflowCount] = useState(0)
  const checkOverflow = () => {
    const totalWidth = rowRef.current!.clientWidth
    const avatarsWidth = avatarWidth + (avatarWidth - avatarOverlap) * (totalAvatars - 1)
    const overflowCount = totalWidth >= avatarsWidth
      ? 0
      : Math.ceil((avatarsWidth - totalWidth) / (avatarWidth - avatarOverlap))
    setOverflowCount(overflowCount)
  }
  useLayoutEffect(checkOverflow, [])
  useResizeObserver(checkOverflow, rowRef)
  return overflowCount
}

export default usePokerAvatarOverflow
