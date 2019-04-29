import React, {ReactElement, useCallback, useEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import requestDoubleAnimationFrame from 'universal/components/RetroReflectPhase/requestDoubleAnimationFrame'
import hideBodyScroll from 'universal/utils/hideBodyScroll'

export const enum PortalState {
  Entering, // node appended to DOM
  Entered, // 2 animation frames after appended to DOM
  AnimatedIn,
  Exiting, // closePortal was called
  Exited // initial state
}

export interface UsePortalOptions {
  onOpen?: (el: HTMLElement) => void
  onClose?: () => void
}
const usePortal = (options: UsePortalOptions) => {
  const portalRef = useRef<HTMLDivElement>()
  const originRef = useRef<HTMLElement>()
  const showBodyScroll = useRef<() => void>()
  const [portalState, setPortalState] = useState(PortalState.Exited)

  const terminatePortal = useCallback(() => {
    if (portalRef.current) {
      document.body.removeChild(portalRef.current)
      portalRef.current = undefined
      showBodyScroll.current && showBodyScroll.current()
    }
  }, [])

  // terminate on unmount
  useEffect(() => terminatePortal, [])

  const closePortal = useCallback(() => {
    document.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('mousedown', handleDocumentClick)
    document.removeEventListener('touchstart', handleDocumentClick)
    if (portalRef.current) {
      portalRef.current.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'transform') {
          terminatePortal()
        }
      })
    }
    setPortalState(PortalState.Exiting)
    // important! this should be last in case the onClose also tries to close the portal (see EmojiMenu)
    options.onClose && options.onClose()
  }, [])

  const handleKeydown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (originRef.current) {
        // give focus back to the thing that opened it
        originRef.current.focus()
      }
      closePortal()
    }
  }, [])

  const handleDocumentClick = useCallback((e: MouseEvent | TouchEvent) => {
    if (!portalRef.current) return
    const target = e.target as Node
    if (!portalRef.current.contains(target)) {
      // clicks on the toggle must be ignored, otherwise a long click where mouseup occurs after close will trigger a reopen
      if (!originRef.current || !originRef.current.contains(target)) {
        closePortal()
      }
    }
  }, [])

  const openPortal = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    terminatePortal()
    portalRef.current = document.createElement('div')
    portalRef.current.id = 'portal'
    document.body.appendChild(portalRef.current)
    showBodyScroll.current = hideBodyScroll()
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('mousedown', handleDocumentClick)
    document.addEventListener('touchstart', handleDocumentClick)
    setPortalState(PortalState.Entering)
    if (e && e.currentTarget) {
      originRef.current = e.currentTarget as HTMLElement
    }
    // without rDAF: 1) coords may not be updated (if useCoords is used), 2) `enter` class hasn't had time to flush (if animations are used)
    requestDoubleAnimationFrame(() => {
      setPortalState(PortalState.Entered)
    })
    options.onOpen && options.onOpen(portalRef.current)
  }, [])

  const togglePortal = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    portalRef.current ? closePortal() : openPortal(e)
  }, [])

  const portal = useCallback(
    (reactEl: ReactElement) => {
      const targetEl = portalRef.current
      return !targetEl || portalState === PortalState.Exited
        ? null
        : createPortal(reactEl, targetEl)
    },
    [portalState]
  )

  return {
    openPortal,
    closePortal,
    terminatePortal,
    togglePortal,
    portal,
    portalState,
    setPortalState
  }
}

export default usePortal
