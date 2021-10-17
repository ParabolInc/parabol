import {RefObject, useLayoutEffect, useState} from 'react'
import useResizeObserver from './useResizeObserver'

const useGetRefVal = (ref: RefObject<HTMLDivElement>, value?) => {
  const [height, setHeight] = useState(0)

  const getVal = () => {
    const {current: el} = ref
    const height = el?.[value || 'clientHeight']
    if (!height) return
    setHeight(height)
  }

  useLayoutEffect(getVal, [ref])
  useResizeObserver(getVal, ref)
  return height
}

export default useGetRefVal
