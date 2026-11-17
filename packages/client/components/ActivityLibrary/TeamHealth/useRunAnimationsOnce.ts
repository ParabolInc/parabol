import {useEffect, useRef, useState} from 'react'

// Holds an element's looping CSS animations on the frame at endSeconds the first time they reach
// it. Seeking each animation there (rather than pausing wherever a throttled timer finds it) makes
// the held frame the same every time
const useRunAnimationsOnce = <T extends Element>(endSeconds: number) => {
  const ref = useRef<T>(null)
  const [isFinished, setIsFinished] = useState(false)

  useEffect(() => {
    if (isFinished) return
    const timeout = window.setTimeout(() => {
      const animations = ref.current?.getAnimations({subtree: true}) ?? []
      // nothing runs under prefers-reduced-motion, so there is nothing to replay
      if (animations.length === 0) return
      animations.forEach((animation) => {
        animation.pause()
        animation.currentTime = endSeconds * 1000
      })
      setIsFinished(true)
    }, endSeconds * 1000)
    return () => window.clearTimeout(timeout)
  }, [isFinished, endSeconds])

  const replay = () => {
    ref.current?.getAnimations({subtree: true}).forEach((animation) => {
      animation.currentTime = 0
      animation.play()
    })
    setIsFinished(false)
  }

  return {ref, isFinished, replay}
}

export default useRunAnimationsOnce
