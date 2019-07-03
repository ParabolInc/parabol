import {DASH_SIDEBAR} from 'universal/components/Dashboard/DashSidebar'
import React, {ReactNode, useCallback, useEffect} from 'react'
import usePortal from 'universal/hooks/usePortal'
import useRefState from 'universal/hooks/useRefState'
import {ZIndex} from 'universal/types/constEnums'
import {DECELERATE} from 'universal/styles/animation'
import styled from 'react-emotion'
import {PALETTE} from 'universal/styles/paletteV2'
import hideBodyScroll from 'universal/utils/hideBodyScroll'

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
  left: 0,
  position: 'fixed',
  pointerEvents: x > 0 ? undefined : 'none',
  transition: `background 200ms ${DECELERATE}`,
  width: '100%',
  zIndex: ZIndex.SIDEBAR
}))

const SwipeableSidebar = styled('div')(({x}: {x: number}) => ({
  display: 'flex',
  position: 'fixed',
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

const updateSpeed = (clientX: number) => {
  const movementX = swipe.startX - clientX
  const dx = Math.abs(movementX)
  const now = performance.now()
  const duration = now - swipe.lastMove
  const speed = dx / duration
  swipe.speed = swipe.speed * 0.4 + speed * 0.6
  swipe.lastMove = now
  swipe.lastX = clientX
}

const updateIsSwipe = (clientX: number, clientY: number) => {
  const movementX = swipe.startX - clientX
  const movementY = swipe.startY - clientY
  const dx = Math.abs(movementX)
  const dy = Math.abs(movementY)
  const rads = -Math.atan(movementX / dy)
  if (dx > UNCERTAINTY_THRESHOLD || dy > UNCERTAINTY_THRESHOLD) {
    // if it's open & it's a swipe to the left || it's closed & it's a swipe to the right
    swipe.isSwipe = swipe.openAtRest ? rads <= -MIN_ARC_RADS : rads >= MIN_ARC_RADS
  }
}

const HYSTERESIS = 0.55 // how far must it be pulled out to stay out (0 -1)
const HYSTERESIS_THRESH = HYSTERESIS * DASH_SIDEBAR.WIDTH
const MIN_ARC_ANGLE = 30 // how sloppy can the pull be. 0 means everything is a drag, 90 means all but perfect pulls are a scroll (0 - 90)
const MIN_ARC_RADS = (MIN_ARC_ANGLE / 180) * Math.PI
const MIN_SPEED = 5 // faster than this and it's a fling
const UNCERTAINTY_THRESHOLD = 3 // pixels to move along 1 plane until we determine intent
// singleton ref
const swipe = {
  downCaptured: false, // true if a touchstart or mousedown event has fired and the end/up event has not fired
  openAtRest: false, // true if the sidebar has been open for 100ms+
  openAtRestTimeout: undefined as undefined | number,
  peekTimeout: undefined as undefined | number,
  lastMove: 0, // last time a move event was fired
  lastX: 0, // last position during a move event
  speed: 0, // the mouse speed, based on a moving average
  startX: 0,
  startY: 0,
  isSwipe: null as null | boolean, // null if unsure, true if we're confident the intent is to swipe
  showBodyScroll: null as (() => void) | null // thunk to call to unlock body scrolling
}

const SwipeableDashSidebar = (props: Props) => {
  const {children} = props
  const {portal, openPortal} = usePortal({allowScroll: true, noClose: true})
  const [xRef, setX] = useRefState(0)
  useEffect(() => {
    openPortal()
    return () => {
      window.clearTimeout(swipe.openAtRestTimeout)
      window.clearTimeout(swipe.peekTimeout)
    }
  }, [])

  const closeWhenOpen = useCallback(() => {
    if (swipe.openAtRest) {
      hideSidebar()
    }
  }, [])

  const hideSidebar = useCallback(() => {
    swipe.openAtRest = false
    swipe.speed = 0
    setX(0)
    swipe.showBodyScroll && swipe.showBodyScroll()
  }, [])

  const showSidebar = useCallback(() => {
    setX(DASH_SIDEBAR.WIDTH)
    swipe.showBodyScroll = hideBodyScroll()
  }, [])

  const onMouseUp = useCallback((e: MouseEvent | TouchEvent) => {
    swipe.downCaptured = false
    window.clearTimeout(swipe.peekTimeout)
    const eventType = isTouch(e) ? 'touchmove' : 'mousemove'
    document.removeEventListener(eventType, onMouseMove)

    const isFling = swipe.speed >= MIN_SPEED
    if (isFling) {
      swipe.openAtRest ? hideSidebar() : showSidebar()
    } else {
      xRef.current > HYSTERESIS_THRESH ? showSidebar() : hideSidebar()
    }
    swipe.openAtRestTimeout = window.setTimeout(() => {
      if (xRef.current === DASH_SIDEBAR.WIDTH) {
        swipe.openAtRest = true
      }
    }, 100)
  }, [])

  const onMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    const event = isTouch(e) ? e.touches[0] : e
    const {clientX, clientY} = event
    if (swipe.isSwipe === null) {
      // they don't want a peek
      window.clearTimeout(swipe.peekTimeout)
      updateIsSwipe(clientX, clientY)
      if (!swipe.isSwipe) {
        if (swipe.isSwipe === false) {
          onMouseUp(e)
        }
        return
      }
    }

    updateSpeed(clientX)
    const minWidth = swipe.openAtRest ? 0 : PEEK_WIDTH
    const nextX = Math.min(DASH_SIDEBAR.WIDTH, Math.max(minWidth, clientX))
    setX(nextX)
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // prevent a mousedown + touchstart
    if (swipe.downCaptured) return
    if (xRef.current !== 0 && xRef.current !== DASH_SIDEBAR.WIDTH) return
    let event
    if (isReactTouch(e)) {
      document.addEventListener('touchend', onMouseUp, {once: true})
      document.addEventListener('touchmove', onMouseMove)
      event = e.touches[0]
    } else {
      document.addEventListener('mouseup', onMouseUp, {once: true})
      document.addEventListener('mousemove', onMouseMove)
      event = e
    }
    const {clientX, clientY} = event
    swipe.startX = clientX
    swipe.startY = clientY
    swipe.lastMove = performance.now()
    swipe.lastX = clientX
    swipe.isSwipe = null
    swipe.speed = 0
    if (xRef.current === 0) {
      // if it's closed & then press down without moving, it's probably to sneak a peek
      swipe.peekTimeout = window.setTimeout(() => {
        setX(PEEK_WIDTH)
      }, 100)
    }
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
