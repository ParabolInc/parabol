import {useEffect, useRef} from 'react'

interface Props {
  onTrigger: () => void
  hasMore: boolean
  isLoading: boolean
}

const InfiniteScrollSentinel = ({onTrigger, hasMore, isLoading}: Props) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || !hasMore || isLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onTrigger()
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, isLoading, onTrigger])

  if (!hasMore) return null

  return <div ref={ref} style={{height: 20, width: '100%'}} />
}

export default InfiniteScrollSentinel
