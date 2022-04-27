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

const useOverflowAvatars = <T extends {id: string}>(items: readonly T[], maxAvatars = 0) => {
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
    const visibleIdx = visibleUsers.findIndex((user) => user.id === transitionChild.child.id)
    const displayIdx = visibleIdx === -1 ? idx : visibleIdx
    return {
      ...transitionChild,
      displayIdx
    }
  })
}

export default useOverflowAvatars
