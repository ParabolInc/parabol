import {RefObject, useLayoutEffect, useState} from 'react'
import useResizeObserver from './useResizeObserver'
import useTransition from './useTransition'

class OverflowAvatar {
  id = 'overflow'
  key = 'overflow'
  overflowCount: number
  displayIdx: number
  constructor(overflowCount: number, displayIdx: number) {
    this.overflowCount = overflowCount
    this.displayIdx = displayIdx
  }
}

const useOverflowAvatars = <T extends {id: string}>(
  rowRef: RefObject<HTMLDivElement>,
  items: readonly T[],
  avatarWidth: number,
  avatarOverlap: number
) => {
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
  const totalItems = items.length
  const overflowCount = maxAvatars > 0 && totalItems > maxAvatars ? totalItems - maxAvatars + 1 : 0
  const visibleUsers = overflowCount === 0 ? items : items.slice(0, maxAvatars - 1)
  const visibleAvatars = visibleUsers.map((user, displayIdx) => ({
    ...user,
    key: user.id,
    // we are setting the avatars using a transform & we want the new ones to appear where they eventually will be
    displayIdx
  })) as ((T & {key: string; displayIdx: number}) | OverflowAvatar)[]

  if (overflowCount > 0) {
    visibleAvatars.push(new OverflowAvatar(overflowCount, visibleAvatars.length))
  }

  const transitioningAvatars = useTransition(visibleAvatars)
  return transitioningAvatars.map((transitionChild, idx) => {
    if (transitionChild.child instanceof OverflowAvatar) {
      return {
        ...transitionChild,
        displayIdx: transitionChild.child.displayIdx
      }
    }
    const visibleIdx = visibleUsers.findIndex((user) => user.id === transitionChild.child.id)
    const displayIdx = visibleIdx === -1 ? idx : visibleIdx
    return {
      ...transitionChild,
      displayIdx
    }
  })
}

export default useOverflowAvatars
