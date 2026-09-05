import {useEffect, useState} from 'react'

export const visualViewportBottom = (innerHeight: number, height: number, offsetTop: number) =>
  Math.max(0, Math.round(innerHeight - height - offsetTop))

const readBottom = () => {
  if (typeof window === 'undefined') return 0
  const vv = window.visualViewport
  if (!vv) return 0
  return visualViewportBottom(window.innerHeight, vv.height, vv.offsetTop)
}

export const subscribeVisualViewportBottom = (
  enabled: boolean,
  setBottom: (bottom: number) => void
) => {
  if (!enabled) {
    setBottom(0)
    return undefined
  }
  const vv = window.visualViewport
  if (!vv) return undefined
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
}

const useVisualViewportBottom = (enabled = true) => {
  const [bottom, setBottom] = useState(() => (enabled ? readBottom() : 0))
  useEffect(() => subscribeVisualViewportBottom(enabled, setBottom), [enabled])
  return bottom
}

export default useVisualViewportBottom
