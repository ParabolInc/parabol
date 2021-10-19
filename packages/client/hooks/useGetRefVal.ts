import {RefObject, useLayoutEffect, useState} from 'react'
import useResizeObserver from './useResizeObserver'

const useGetRefVal = <T extends keyof HTMLDivElement>(ref: RefObject<HTMLDivElement>, key: T) => {
  const [val, setVal] = useState<null | HTMLDivElement[T]>(null)
  const getVal = () => {
    const {current: el} = ref
    const val = el?.[key]
    if (!val) return
    setVal(val)
  }

  useLayoutEffect(getVal, [ref])
  useResizeObserver(getVal, ref)
  return val
}

export default useGetRefVal
