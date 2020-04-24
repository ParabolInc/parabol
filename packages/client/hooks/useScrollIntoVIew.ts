import {RefObject, useEffect} from 'react'
import {requestIdleCallback} from '../utils/requestIdleCallback'

const useScrollIntoView = (ref: RefObject<HTMLElement>, isNeeded: boolean) => {
  useEffect(() => {
    if (isNeeded) {
      requestIdleCallback(() => {
        ref.current && ref.current.scrollIntoView({behavior: 'smooth'})
      })
    }
  }, [isNeeded, ref])
}

export default useScrollIntoView
