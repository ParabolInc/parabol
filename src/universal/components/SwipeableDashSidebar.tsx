import {DASH_SIDEBAR} from 'universal/components/Dashboard/DashSidebar'
import React, {ReactNode, useCallback, useEffect, useRef} from 'react'
import usePortal from 'universal/hooks/usePortal'
import useRefState from 'universal/hooks/useRefState'
import {ZIndex} from 'universal/types/constEnums'
import {DECELERATE} from 'universal/styles/animation'
import styled from 'react-emotion'
import {PALETTE} from 'universal/styles/paletteV2'

const SidebarAndBackdrop = styled('div')({
  position: 'absolute',
  left: -DASH_SIDEBAR.WIDTH,
  top: 0,
  height: '100%',
  width: `calc(100% + ${DASH_SIDEBAR.WIDTH}px)`
})

const Backdrop = styled('div')(({x}: {x: number}) => ({
  background: x > HYSTERESIS_THRESH ? PALETTE.BACKGROUND_FORCED_BACKDROP : undefined,
  height: '100%',
  width: '100%',
  position: 'absolute',
  zIndex: ZIndex.SIDEBAR,
  pointerEvents: x > 0 ? undefined : 'none',
  transition: `background 200ms ${DECELERATE}`
}))

const SwipeableSidebar = styled('div')(({x}: {x: number}) => ({
  display: 'flex',
  position: 'absolute',
  transform: `translateX(${x}px)`,
  transition: `transform 200ms ${DECELERATE}`,
  zIndex: ZIndex.SIDEBAR,
  pointerEvents: x > HYSTERESIS_THRESH ? undefined : 'none'
}))

const PEEK_WIDTH = 20
const SwipeHandle = styled('div')({
  width: PEEK_WIDTH,
  pointerEvents: 'auto'
})

interface Props {
  children: ReactNode
}

const isTouch = (e: MouseEvent | TouchEvent): e is TouchEvent => {
  return (e as any).touches !== undefined
}

const isReactTouch = (e: React.MouseEvent | React.TouchEvent): e is React.TouchEvent => {
  return (e as any).touches !== undefined
}

const HYSTERESIS = 0.55
const HYSTERESIS_THRESH = HYSTERESIS * DASH_SIDEBAR.WIDTH
const SwipeableDashSidebar = (props: Props) => {
  const {children} = props
  const {portal, openPortal} = usePortal({noClose: true})
  const [xRef, setX] = useRefState(0)
  const openAstRestRef = useRef(false)
  const lastTime = useRef(Date.now())
  const velocityRef = useRef(0)
  const timeoutRef = useRef<number>()
  useEffect(() => {
    openPortal()
    return () => {
      window.clearTimeout(timeoutRef.current)
    }
  }, [])

  const closeWhenOpen = useCallback(() => {
    if (openAstRestRef.current) {
      hideSidebar()
    }
  }, [])

  const hideSidebar = useCallback(() => {
    openAstRestRef.current = false
    velocityRef.current = 0
    setX(0)
  }, [])

  const showSidebar = useCallback(() => {
    setX(DASH_SIDEBAR.WIDTH)
  }, [])

  const onMouseUp = useCallback(() => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('touchmove', onMouseMove)
    const isOpening = !openAstRestRef.current
    const isFling = velocityRef.current >= 1
    if (isFling) {
      isOpening ? showSidebar() : hideSidebar()
    } else {
      xRef.current > HYSTERESIS_THRESH ? showSidebar() : hideSidebar()
    }
    timeoutRef.current = window.setTimeout(() => {
      if (xRef.current === DASH_SIDEBAR.WIDTH) {
        openAstRestRef.current = true
      }
    }, 100)
  }, [])

  const onMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    // for some unknown reason, chrome doesn't reliably fire a mouseup event if you mousedown, fling to the right, then mouseup
    const clientX = isTouch(e) ? e.touches[0].clientX : e.clientX
    const nextX = Math.min(DASH_SIDEBAR.WIDTH, Math.max(PEEK_WIDTH, clientX))
    const xDiff = Math.abs(xRef.current - nextX)
    const duration = Date.now() - lastTime.current
    velocityRef.current = xDiff / duration
    lastTime.current = Date.now()
    setX(nextX)
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (xRef.current !== 0 && xRef.current !== DASH_SIDEBAR.WIDTH) return

    if (xRef.current === DASH_SIDEBAR.WIDTH) {
      const clientX = isReactTouch(e) ? e.touches[0].clientX : e.clientX
      if (clientX < DASH_SIDEBAR.WIDTH - PEEK_WIDTH * 2) return
    }
    document.addEventListener('mouseup', onMouseUp, {once: true})
    document.addEventListener('touchend', onMouseUp, {once: true})
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('touchmove', onMouseMove)
    const nextX = xRef.current === 0 ? PEEK_WIDTH : DASH_SIDEBAR.WIDTH
    setX(nextX)
  }, [])

  return portal(
    <SidebarAndBackdrop onClick={closeWhenOpen}>
      <Backdrop x={xRef.current} />
      <SwipeableSidebar x={xRef.current} onMouseDown={onMouseDown} onTouchStart={onMouseDown}>
        {children}
        <SwipeHandle />
      </SwipeableSidebar>
    </SidebarAndBackdrop>
  )
}

export default SwipeableDashSidebar
