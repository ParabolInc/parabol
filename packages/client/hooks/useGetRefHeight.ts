import {RefObject, useLayoutEffect, useState} from 'react'
import useResizeObserver from './useResizeObserver'

const useGetRefHeight = <T extends number | string>(
  ref: RefObject<HTMLDivElement>,
  defaultHeight?: T,
  observerRef?: RefObject<HTMLDivElement>
) => {
  const [height, setHeight] = useState(defaultHeight || 0)

  const getHeight = () => {
    const {current: el} = ref
    const height = el?.clientHeight
    if (!height) return
    setHeight(height)
  }

  useLayoutEffect(getHeight, [ref])
  useResizeObserver(getHeight, observerRef)
  return height
}

export default useGetRefHeight
