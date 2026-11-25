import {useEffect, useRef, useState} from 'react'

const STEPS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4]
const MAX_SCALE = 4
const PAD_X = 88
const PAD_Y = 16
const DRAG_SLOP = 4

interface Size {
  width: number
  height: number
}
interface Point {
  x: number
  y: number
}

const clamp = (v: number, limit: number) => Math.min(limit, Math.max(-limit, v))

export const usePanZoom = (natural: Size | null) => {
  const stageRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState<Size>({width: 0, height: 0})
  const [zoom, setZoom] = useState<number | null>(null)
  const [pan, setPan] = useState<Point>({x: 0, y: 0})
  const dragRef = useRef<(Point & {panX: number; panY: number; moved: boolean}) | null>(null)
  const wheelRef = useRef<(e: WheelEvent) => void>(() => {})

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setStage({width: entry.contentRect.width, height: entry.contentRect.height})
    })
    observer.observe(el)
    const onWheel = (e: WheelEvent) => wheelRef.current(e)
    el.addEventListener('wheel', onWheel, {passive: false})
    return () => {
      observer.disconnect()
      el.removeEventListener('wheel', onWheel)
    }
  }, [])

  const nat = natural ?? {width: 1, height: 1}
  const fit = stage.width
    ? Math.min((stage.width - PAD_X * 2) / nat.width, (stage.height - PAD_Y * 2) / nat.height, 1)
    : 1
  const scale = zoom ?? fit
  const width = nat.width * scale
  const height = nat.height * scale
  const maxX = Math.max(0, (width - stage.width) / 2)
  const maxY = Math.max(0, (height - stage.height) / 2)
  const x = clamp(pan.x, maxX)
  const y = clamp(pan.y, maxY)
  const left = (stage.width - width) / 2 + x
  const top = (stage.height - height) / 2 + y
  const canPan = maxX > 0 || maxY > 0

  const reset = () => {
    setZoom(null)
    setPan({x: 0, y: 0})
  }
  const zoomTo = (next: number, anchor: Point = {x: stage.width / 2, y: stage.height / 2}) => {
    const target = Math.min(MAX_SCALE, next)
    if (target <= fit + 0.001) return reset()
    const imgX = (anchor.x - left) / scale
    const imgY = (anchor.y - top) / scale
    setZoom(target)
    setPan({
      x: anchor.x - stage.width / 2 + (nat.width * target) / 2 - imgX * target,
      y: anchor.y - stage.height / 2 + (nat.height * target) / 2 - imgY * target
    })
  }
  const zoomIn = () => zoomTo(STEPS.find((s) => s > scale + 0.001) ?? MAX_SCALE)
  const zoomOut = () => zoomTo(STEPS.filter((s) => s < scale - 0.001).pop() ?? fit)
  const toStage = (e: {clientX: number; clientY: number}) => {
    const rect = stageRef.current!.getBoundingClientRect()
    return {x: e.clientX - rect.left, y: e.clientY - rect.top}
  }
  wheelRef.current = (e) => {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    zoomTo(scale * Math.exp(-e.deltaY * 0.01), toStage(e))
  }

  const imageHandlers = {
    onPointerDown: (e: React.PointerEvent<HTMLImageElement>) => {
      dragRef.current = {x: e.clientX, y: e.clientY, panX: x, panY: y, moved: false}
      if (canPan) e.currentTarget.setPointerCapture(e.pointerId)
    },
    onPointerMove: (e: React.PointerEvent<HTMLImageElement>) => {
      const drag = dragRef.current
      if (!drag) return
      const dx = e.clientX - drag.x
      const dy = e.clientY - drag.y
      if (Math.abs(dx) + Math.abs(dy) > DRAG_SLOP) drag.moved = true
      if (canPan && drag.moved) setPan({x: drag.panX + dx, y: drag.panY + dy})
    },
    onPointerUp: (e: React.PointerEvent<HTMLImageElement>) => {
      const drag = dragRef.current
      dragRef.current = null
      if (!drag || drag.moved) return
      if (zoom !== null) return reset()
      zoomTo(fit < 0.95 ? 1 : 2, toStage(e))
    }
  }

  return {
    stageRef,
    rect: {left, top, width, height},
    scale,
    isFit: zoom === null,
    canPan,
    canZoomIn: scale < MAX_SCALE,
    zoomIn,
    zoomOut,
    zoomToActual: () => zoomTo(1),
    reset,
    imageHandlers
  }
}
