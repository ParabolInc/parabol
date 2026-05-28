import {type RefObject, useEffect, useLayoutEffect, useState} from 'react'

// These match the CSS defined in NewMeetingAvatar and MeetingOverflowMenu
const getSlotDimensions = (containerWidth: number) => {
  if (containerWidth >= 1600) return {avatarPx: 56, paddingPx: 3, overlapPx: 14}
  if (containerWidth >= 1280) return {avatarPx: 48, paddingPx: 3, overlapPx: 14}
  return {avatarPx: 32, paddingPx: 3, overlapPx: 14}
}

export const useAvatarOverflowThreshold = (ref: RefObject<HTMLElement | null>) => {
  const [containerWidth, setContainerWidth] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setContainerWidth(el.getBoundingClientRect().width)
  }, [ref])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setContainerWidth(entry!.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])

  if (containerWidth === 0) return Number.POSITIVE_INFINITY

  const {avatarPx, paddingPx, overlapPx} = getSlotDimensions(containerWidth)
  const slotWidth = avatarPx + paddingPx * 2
  const netSlot = slotWidth - overlapPx
  // Reserve 2 slots: AddTeamMember button + overflow indicator
  return Math.max(1, Math.floor((containerWidth - netSlot * 2) / netSlot))
}
