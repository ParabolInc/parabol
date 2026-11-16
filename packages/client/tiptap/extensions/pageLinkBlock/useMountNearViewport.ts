import {type RefObject, useEffect, useState, useSyncExternalStore} from 'react'
import {isMountAllRequested, subscribeToMountAll} from './syncedBlockPrint'

export const useMountNearViewport = (ref: RefObject<HTMLElement | null>) => {
  const isPrinting = useSyncExternalStore(subscribeToMountAll, isMountAllRequested)
  const [shouldStayMounted, setShouldStayMounted] = useState(
    typeof IntersectionObserver === 'undefined'
  )
  if (isPrinting && !shouldStayMounted) setShouldStayMounted(true)
  const isMounted = shouldStayMounted || isPrinting

  useEffect(() => {
    const el = ref.current
    if (!el || isMounted) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldStayMounted(true)
          observer.disconnect()
        }
      },
      {rootMargin: '100% 0px'}
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, isMounted])

  return isMounted
}
