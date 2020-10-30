import styled from '@emotion/styled'
import React, {ReactNode, useCallback, useEffect} from 'react'
import useEventCallback from '~/hooks/useEventCallback'
import usePortal from '../hooks/usePortal'
import useRefState from '../hooks/useRefState'
import {DECELERATE} from '../styles/animation'
import {navDrawerShadow} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV2'
import {DiscussionThreadEnum, NavSidebar, ZIndex} from '../types/constEnums'
import hideBodyScroll from '../utils/hideBodyScroll'
import PlainButton from './PlainButton/PlainButton'

const PEEK_WIDTH = 20

const SidebarAndScrim = styled('div')<{isRightSidebar: boolean | undefined}>(
  ({isRightSidebar}) => ({
    position: 'absolute',
    left: isRightSidebar ? undefined : -NavSidebar.WIDTH,
    // left: isRightSidebar ? NavSidebar.WIDTH : -NavSidebar.WIDTH,
    right: isRightSidebar ? -DiscussionThreadEnum.WIDTH : undefined,
    top: 0,
    height: '100%'
    // border: '2px solid pink'
  })
)

interface StyleProps {
  x: number
  isRightSidebar?: boolean | undefined
  hysteresisThresh?: number
}

const Scrim = styled('div')<StyleProps>(({x}) => ({
  background: PALETTE.BACKGROUND_FORCED_BACKDROP,
  height: '100%',
  left: 0,
  opacity: x / DiscussionThreadEnum.WIDTH,
  position: 'fixed',
  pointerEvents: x > 0 ? undefined : 'none',
  transition: `opacity 200ms ${DECELERATE}`,
  width: '100%',
  zIndex: ZIndex.SIDEBAR,
  border: '2px solid yellow'
}))

const SidebarAndHandle = styled('div')<StyleProps>(({x, isRightSidebar}) => ({
  display: 'flex',
  position: 'fixed',
  background: 'green',
  transform: `translateX(${isRightSidebar ? -x : x}px)`,
  // transform: `translateX(${x}px)`,
  transition: `transform 200ms ${DECELERATE}`,
  // zIndex: ZIndex.SIDEBAR,
  zIndex: 1000,
  height: '100vw',
  // minWidth: PEEK_WIDTH,
  // top: 0,
  // right: 0,
  // right: x < 256 ? 0 : undefined,
  // width: '100%',
  border: '2px solid navy'
}))

const Sidebar = styled('div')<StyleProps>(({x, isRightSidebar, hysteresisThresh}) => ({
  boxShadow: x > 0 ? navDrawerShadow : undefined,
  pointerEvents: x > hysteresisThresh ? undefined : 'none',
  height: '100vw',
  // minWidth: PEEK_WIDTH,
  border: '2px solid pink',
  // display: 'flex',
  // position: 'absolute',
  // top: 0,
  // right: 0,
  zIndex: 999
}))

const RightSwipeHandle = styled(PlainButton)({
  width: PEEK_WIDTH,
  background: 'silver',
  display: 'flex',
  position: 'fixed',
  right: 0,
  height: '100vh'
})

const SwipeHandle = styled(PlainButton)({
  width: PEEK_WIDTH
})

const updateSpeed = (clientX: number) => {
  const movementX = swipe.lastX - clientX
  const dx = Math.abs(movementX)
  const now = performance.now()
  const duration = now - swipe.lastMove
  const speed = dx / duration
  swipe.speed = swipe.speed * 0.4 + speed * 0.6
  swipe.lastMove = now
  swipe.lastX = clientX
}

const updateIsSwipe = (clientX: number, clientY: number, isRightSidebar: boolean | undefined) => {
  const movementX = swipe.startX - clientX
  const movementY = swipe.startY - clientY
  const dx = Math.abs(movementX)
  const dy = Math.abs(movementY)
  const rads = -Math.atan(movementX / dy)
  if (dx > UNCERTAINTY_THRESHOLD || dy > UNCERTAINTY_THRESHOLD) {
    // if it's open & it's a swipe to the left || it's closed & it's a swipe to the right
    const swipingLeft = rads <= -MIN_ARC_RADS
    console.log('updateIsSwipe -> swipingLeft', swipingLeft)
    const swipingRight = rads >= MIN_ARC_RADS
    console.log('updateIsSwipe -> swipingRight', swipingRight)

    // swipe.isSwipe = swipe.isOpen ? rads <= -MIN_ARC_RADS : rads >= MIN_ARC_RADS
    swipe.isSwipe = swipe.isOpen
      ? isRightSidebar
        ? swipingRight
        : swipingLeft
      : isRightSidebar
      ? swipingLeft
      : swipingRight
    console.log('SWIPE ---->>> updateIsSwipe -> swipe.isSwipe', swipe.isSwipe)
  }
}

const getHysteresisThresh = (sidebarWidth: number) => HYSTERESIS * sidebarWidth

const HYSTERESIS = 0.55 // how far must it be pulled out to stay out (0 -1)
// const HYSTERESIS_THRESH = HYSTERESIS * NavSidebar.WIDTH
const MIN_ARC_ANGLE = 30 // how sloppy can the pull be. 0 means everything is a swipe, 90 degrees means only perfectly horizontal drags are a swipe (0 - 90)
const MIN_ARC_RADS = (MIN_ARC_ANGLE / 180) * Math.PI
const MIN_SPEED = 0.3 // faster than this and it's a fling (0 - 5+)
const UNCERTAINTY_THRESHOLD = 3 // pixels to move along 1 plane until we determine intent

const swipe = {
  isOpen: false,
  downCaptured: false, // true if a touchstart or mousedown event has fired and the end/up event has not fired
  peekTimeout: undefined as undefined | number,
  lastMove: 0, // last time a move event was fired
  lastX: 0, // last position during a move event
  speed: 0, // the mouse speed based on a moving average
  startX: 0, // the X coord at the mouse/touch start
  startY: 0, // the Y coord at the mouse/touch start
  isSwipe: null as null | boolean, // null if unsure true if we're confident the intent is to swipe
  showBodyScroll: null as (() => void) | null // thunk to call to unlock body scrolling
}

interface Props {
  children: ReactNode
  isOpen: boolean
  isRightSidebar?: boolean
  onToggle: () => void
}

const SwipeableDashSidebar = (props: Props) => {
  const {children, isOpen, isRightSidebar, onToggle} = props
  const sidebarWidth = isRightSidebar ? DiscussionThreadEnum.WIDTH : NavSidebar.WIDTH
  const {portal, openPortal} = usePortal({
    allowScroll: true,
    noClose: true
  })
  const [xRef, setX] = useRefState(0)
  useEffect(
    () => {
      openPortal()
      return () => {
        window.clearTimeout(swipe.peekTimeout)
        hideSidebar()
      }
    },
    [
      /* eslint-disable-line react-hooks/exhaustive-deps*/
    ]
  )

  const hideSidebar = useCallback(() => {
    setX(0)
    swipe.showBodyScroll && swipe.showBodyScroll()
  }, [setX])

  const showSidebar = useCallback(() => {
    setX(sidebarWidth)
    swipe.showBodyScroll = hideBodyScroll()
  }, [setX])

  useEffect(() => {
    // showSidebar()
    if (isOpen !== swipe.isOpen) {
      swipe.isOpen = isOpen
      isOpen ? showSidebar() : hideSidebar()
    }
  }, [isOpen, hideSidebar, showSidebar])

  const onMouseUp = useEventCallback(
    (e: MouseEvent | TouchEvent, isRightSidebar: boolean | undefined) => {
      window.clearTimeout(swipe.peekTimeout)
      const eventType = e.type === 'mouseup' ? 'mousemove' : 'touchmove'
      document.removeEventListener(eventType, onMouseMove)
      const movementX = swipe.lastX - swipe.startX
      const {isOpen: nextIsOpen} = swipe
      const isOpening = movementX > 0 !== nextIsOpen
      const isFling = swipe.speed >= MIN_SPEED && isOpening
      console.log('xRef.current', xRef.current)
      if (isFling) {
        onToggle()
      } else if (xRef.current > getHysteresisThresh(sidebarWidth)) {
        if (!nextIsOpen) {
          onToggle()
        } else {
          showSidebar()
        }
      } else {
        if (nextIsOpen) {
          onToggle()
        } else {
          hideSidebar()
        }
      }
      swipe.downCaptured = false
      // TODO can remove?
      // setTimeout(() => {
      swipe.isSwipe = null
      swipe.speed = 0
      // })
    }
  )

  const onMouseMove = useEventCallback((e: MouseEvent | TouchEvent) => {
    const event = e.type === 'touchmove' ? (e as TouchEvent).touches[0] : (e as MouseEvent)
    const {clientX, clientY} = event
    console.log('MOVE onMouseMove -> swipe.isSwipe', swipe.isSwipe)
    if (swipe.isSwipe === null) {
      // they don't want a peek
      window.clearTimeout(swipe.peekTimeout)
      updateIsSwipe(clientX, clientY, isRightSidebar)
      if (!swipe.isSwipe) {
        // TODO: Remove ^
        if (swipe.isSwipe === false) {
          onMouseUp(e)
        }
        return
      }
    }

    // const movementX = clientX - swipe.lastX
    const movementX = isRightSidebar ? swipe.lastX - clientX : clientX - swipe.lastX
    const minWidth = swipe.isOpen ? 0 : PEEK_WIDTH
    const nextX = Math.min(sidebarWidth, Math.max(minWidth, xRef.current + movementX))
    updateSpeed(clientX)
    setX(nextX)
  })

  const onMouseDown = useEventCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (swipe.downCaptured) return
    const {current: x} = xRef
    if (x !== 0 && x !== sidebarWidth) return
    const isTouchStart = e.type === 'touchstart'
    let event: {clientX: number; clientY: number}
    if (isTouchStart) {
      document.addEventListener('touchend', (e) => onMouseUp(e, isRightSidebar), {once: true})
      document.addEventListener('touchmove', onMouseMove)
      event = (e as React.TouchEvent).touches[0]
    } else {
      document.addEventListener('mouseup', (e) => onMouseUp(e, isRightSidebar), {once: true})
      document.addEventListener('mousemove', onMouseMove)
      event = e as React.MouseEvent
    }
    const {clientX, clientY} = event
    swipe.startX = clientX
    swipe.startY = clientY
    swipe.lastMove = performance.now()
    swipe.lastX = clientX
    swipe.isSwipe = null
    swipe.speed = 0
    if (x === 0) {
      // if it's closed & then press down without moving, it's probably to sneak a peek
      swipe.peekTimeout = window.setTimeout(() => {
        setX(PEEK_WIDTH)
      }, 100)
    }
  })

  const {current: x} = xRef

  return portal(
    <SidebarAndScrim isRightSidebar={isRightSidebar}>
      <Scrim x={x} onClick={onToggle} />
      <RightSwipeHandle onMouseDown={onMouseDown} onTouchStart={onMouseDown} />
      <SidebarAndHandle
        x={x}
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
        isRightSidebar={isRightSidebar}
      >
        <Sidebar
          x={x}
          isRightSidebar={isRightSidebar}
          hysteresisThresh={getHysteresisThresh(sidebarWidth)}
        >
          {children}
        </Sidebar>
        <SwipeHandle />
      </SidebarAndHandle>
    </SidebarAndScrim>
  )
}

export default SwipeableDashSidebar
