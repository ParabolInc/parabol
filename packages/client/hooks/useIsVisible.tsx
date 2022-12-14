import {useEffect, useState} from 'react'

const useIsVisible = (element?: HTMLElement | null, threshold = 0.5) => {
  const [visible, setVisible] = useState(false)
  const [intersectionObserver] = useState(() => {
    return new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        setVisible(!!(entry && entry.intersectionRatio > threshold))
      },
      {
        threshold
      }
    )
  })
  useEffect(() => {
    return () => {
      intersectionObserver.disconnect()
    }
  }, [])
  useEffect(() => {
    if (!element) return
    intersectionObserver.observe(element)
    return () => {
      intersectionObserver.unobserve(element)
    }
  }, [element])

  return visible
}

export default useIsVisible
