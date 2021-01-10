import {MutableRefObject, useCallback, useRef, useState} from 'react'
import {BBox} from '../types/animations'
import getBBox from '../components/RetroReflectPhase/getBBox'

const useCallbackRefBBox = (): [
  (node) => void,
  BBox | null,
  MutableRefObject<HTMLDivElement | null>
] => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [bbox, setBbox] = useState<BBox | null>(null)

  const callbackRef = useCallback((node) => {
    if (node !== null) {
      ref.current = node
      const bbox = getBBox(node)
      setBbox(bbox)
    }
  }, [])

  return [callbackRef, bbox, ref]
}

export default useCallbackRefBBox
