import {useEffect, useRef, useState} from 'react'

const useAnimatedPhaseListChildren = (isActive: boolean, itemCount: number) => {
  const [height, setHeight] = useState(isActive ? 'fit-content' : 0)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const scrollHeight = ref.current?.scrollHeight
    setHeight(scrollHeight ?? 0)
  }, [itemCount])

  const wasActiveRef = useRef(isActive)
  useEffect(() => {
    if (isActive === wasActiveRef.current) return
    if (isActive) {
      ref.current!.style.overflow = 'hidden'
      setTimeout(() => {
        ref.current!.style.overflow = ''
      }, 300)
    }
    wasActiveRef.current = isActive
  }, [isActive])
  return {height: isActive ? height : 0, ref}
}

export default useAnimatedPhaseListChildren
