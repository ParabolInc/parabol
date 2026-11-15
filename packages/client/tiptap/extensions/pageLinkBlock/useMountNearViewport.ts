import {type RefObject, useEffect, useState} from 'react'

export const useMountNearViewport = (ref: RefObject<HTMLElement | null>) => {
  const [isMounted, setIsMounted] = useState(typeof IntersectionObserver === 'undefined')

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
