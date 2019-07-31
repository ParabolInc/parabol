import {useEffect} from 'react'
import useRefState from './useRefState'

const useInterval = (duration: number, iters: number) => {
  const [countRef, setCount] = useRefState<number>(0)
  useEffect(() => {
    const interval = window.setInterval(() => {
      const nextCount = countRef.current + 1
      setCount(nextCount)
      if (nextCount >= iters) {
        window.clearInterval(interval)
      }
    }, duration)
    return () => {
      window.clearInterval(interval)
    }
  }, [countRef, duration, iters, setCount])
  return countRef.current
}

export default useInterval
