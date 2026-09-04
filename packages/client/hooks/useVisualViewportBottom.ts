import {useEffect, useState} from 'react'

const readBottom = () => {
  if (typeof window === 'undefined') return 0
  const vv = window.visualViewport
  if (!vv) return 0
  return Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop))
}

const useVisualViewportBottom = () => {
  const [bottom, setBottom] = useState(readBottom)
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    let frame = 0
    const update = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        setBottom(readBottom())
      })
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    update()
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])
  return bottom
}

export default useVisualViewportBottom
