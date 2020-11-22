import {RefObject, useEffect} from 'react'
import useForceUpdate from './useForceUpdate'

const useResizeFontForInput = (ref: RefObject<HTMLInputElement>, value: string, minSize: number, maxSize: number) => {
  const forceUpdate = useForceUpdate()
  useEffect(() => {
    const el = ref.current
    if (!el) {
      forceUpdate()
      return
    }
    const {style} = el
    for (let i = maxSize; i >= minSize; i--) {
      const {clientWidth, scrollWidth} = el
      console.log('trying', i, clientWidth, scrollWidth)
      style.fontSize = `${i}px`
      if (scrollWidth <= clientWidth) return
    }
  }, [value, ref.current])

}
export default useResizeFontForInput
