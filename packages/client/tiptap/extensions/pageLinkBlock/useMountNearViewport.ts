import {type RefObject, useEffect, useState} from 'react'
import {isMountAllRequested, SYNCED_BLOCK_MOUNT_ALL_EVENT} from './syncedBlockPrint'

export const useMountNearViewport = (ref: RefObject<HTMLElement | null>) => {
  const [isMounted, setIsMounted] = useState(
    typeof IntersectionObserver === 'undefined' || isMountAllRequested()
  )

  useEffect(() => {
    if (isMounted) return
    const handleMountAll = () => setIsMounted(true)
    window.addEventListener(SYNCED_BLOCK_MOUNT_ALL_EVENT, handleMountAll)
    return () => window.removeEventListener(SYNCED_BLOCK_MOUNT_ALL_EVENT, handleMountAll)
  }, [isMounted])

  useEffect(() => {
    const el = ref.current
    if (!el || isMounted) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsMounted(true)
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
