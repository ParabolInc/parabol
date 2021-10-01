import {ElementHeight} from '~/types/constEnums'
import {RefObject, useLayoutEffect, useState} from 'react'

const useSourceHeight = (sourceRef: RefObject<HTMLDivElement>) => {
  const [height, setHeight] = useState<number>(ElementHeight.REFLECTION_CARD)

  const getHeight = () => {
    const {current: el} = sourceRef
    const height = el?.clientHeight
    if (!height) return
    setHeight(height)
  }

  useLayoutEffect(getHeight, [sourceRef])
  return height
}

export default useSourceHeight
