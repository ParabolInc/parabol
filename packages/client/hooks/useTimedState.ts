import {useRef, useState} from 'react'

/**
 * State hook that automatically clears itself after a timeout.
 * This is especially useful for situations like showing an error message which disappears after some timeout
 * @param timeout in milliseconds, defaults to 5000
 */
const useTimedState = <T = string>(timeout = 5000) => {
  const [state, setState] = useState<T>()
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const setTimedState = (value: T | undefined = undefined) => {
    clearTimeout(timer.current)
    setState(value)
    if (value) {
      timer.current = setTimeout(() => {
        setState(undefined)
      }, timeout)
    }
  }
  return [state, setTimedState] as const
}

export default useTimedState
