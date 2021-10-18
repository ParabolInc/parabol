import {RefObject, useLayoutEffect, useState} from 'react'
import useResizeObserver from './useResizeObserver'

const useGetRefVal = <T extends keyof HTMLDivElement>(ref: RefObject<HTMLDivElement>, key: T) => {
  const [height, setHeight] = useState<null | HTMLDivElement[T]>(null)
  const getVal = () => {
    const {current: el} = ref
    const height = el?.[key]
    if (!height) return
    setHeight(height)
  }

  useLayoutEffect(getVal, [ref])
  useResizeObserver(getVal, ref)
  return height
}

export default useGetRefVal
