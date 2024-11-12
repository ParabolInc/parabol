import {useEffect, useRef, useState} from 'react'
import {usePaginationFragmentHookType} from 'react-relay/relay-hooks/usePaginationFragment'

const useLoadNextOnScrollBottom = (
  paginationRes: usePaginationFragmentHookType<any, any, any>,
  options?: IntersectionObserverInit,
  loadNextQty = 20
) => {
  const ref = useRef(paginationRes)
  useEffect(() => {
    ref.current = paginationRes
  })

  const [intersectionObserver] = useState(() => {
    return new IntersectionObserver((entries) => {
      const [entry] = entries
      if (entry && entry.intersectionRatio > 0) {
        const {current} = ref
        const {hasNext, isLoadingNext, loadNext} = current
        if (!hasNext || isLoadingNext) return
        loadNext(loadNextQty)
      }
    }, options)
  })
  const lastItemRef = useRef<HTMLDivElement>()
  useEffect(() => {
    return () => {
      intersectionObserver.disconnect()
    }
  }, [])
  return (
    <div
      key={'loadNext'}
      ref={(c) => {
        if (c) {
          intersectionObserver.observe(c)
          lastItemRef.current = c
        } else if (lastItemRef.current) {
          intersectionObserver.unobserve(lastItemRef.current)
        }
      }}
    />
  )
}

export default useLoadNextOnScrollBottom
