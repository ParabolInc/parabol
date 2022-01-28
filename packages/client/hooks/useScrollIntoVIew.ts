import {RefObject, useEffect} from 'react'
import {requestIdleCallback} from '../utils/requestIdleCallback'
import useInitialRender from './useInitialRender'

const useScrollIntoView = (
  ref: RefObject<HTMLElement>,
  isNeeded: boolean,
  onlyIfNotFullyVisible?: boolean
) => {
  const isInit = useInitialRender()
  useEffect(() => {
    if (isNeeded) {
      requestIdleCallback(() => {
        if (!ref.current) return
        if (onlyIfNotFullyVisible) {
          // Be sure to put scroll-behavior: smooth on the overflowing div!
          ref.current.scrollIntoViewIfNeeded()
        } else {
          ref.current.scrollIntoView({behavior: isInit ? undefined : 'smooth'})
        }
      })
    }
  }, [isNeeded, ref])
}

export default useScrollIntoView
