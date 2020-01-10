import {useEffect, useRef} from 'react'

const useInitialRender = () => {
  const isInitialRenderRef = useRef(true)
  useEffect(() => {
    isInitialRenderRef.current = false
  }, [])
  return isInitialRenderRef.current
}

export default useInitialRender
