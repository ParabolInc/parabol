import {useEffect, useState} from 'react'

const useTimeout = (duration) => {
  const [timedOut, setTimedOut] = useState(false)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTimedOut(true)
    }, duration)
    return () => clearTimeout(timer)
  })
  return timedOut
}

export default useTimeout
