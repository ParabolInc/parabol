import {type ReactNode, useEffect, useRef} from 'react'
import {MenuItem} from '../ui/Menu/MenuItem'

// you must see 90% of the row for MINIMUM_VIEW_TIME before it counts as viewed
const MINIMUM_VIEW_TIME = 300
const VIEW_THRESHOLD = 0.9

interface Props {
  children: ReactNode
  onClick: () => void
  onView?: () => void
}

const NotificationMenuItem = (props: Props) => {
  const {children, onClick, onView} = props
  const itemRef = useRef<HTMLDivElement>(null)
  // the callback is recreated every render, so read it from a ref to keep the observer stable
  const onViewRef = useRef(onView)
  onViewRef.current = onView

  useEffect(() => {
    if (!onViewRef.current) return
    const el = itemRef.current
    if (!el) return
    let timer: number | undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          window.clearTimeout(timer)
          timer = undefined
          return
        }
        if (timer) return
        timer = window.setTimeout(() => {
          observer.disconnect()
          onViewRef.current?.()
        }, MINIMUM_VIEW_TIME)
      },
      {threshold: VIEW_THRESHOLD}
    )
    observer.observe(el)
    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  return (
    <MenuItem
      ref={itemRef}
      onClick={onClick}
      // the row paints its own full-bleed background, so drop the item's inset & radius
      className='mx-0 rounded-none p-0'
    >
      {children}
    </MenuItem>
  )
}

export default NotificationMenuItem
