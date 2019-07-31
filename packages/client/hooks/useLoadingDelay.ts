/*
 * Code is loaded via lazy components, which has a nice fallback.
 * When data is loading, it cannot use the same fallback.
 * Sometimes, it's nice to show a single spinner until code + data has loaded.
 * By determining how long it took the code to load, we can start the animation
 * where it left off, making it look seamless.
 */

import {MutableRefObject, useRef} from 'react'
import useForceUpdate from './useForceUpdate'

export type LoadingDelayRef = MutableRefObject<{
  start: number
  stop: number
  forceUpdate: () => void
}>

const useLoadingDelay = () => {
  const forceUpdate = useForceUpdate()
  const loadingDelayRef = useRef({start: 0, stop: 0, forceUpdate})
  const {
    current: {start, stop}
  } = loadingDelayRef
  const loadingDelay = stop ? start - stop : 0
  return {loadingDelay, loadingDelayRef}
}

export default useLoadingDelay
