import React, {ReactNode, createContext, useCallback, useContext, useEffect, useRef} from 'react'
import {createPortal} from 'react-dom'
import requestDoubleAnimationFrame from '../components/RetroReflectPhase/requestDoubleAnimationFrame'
import hideBodyScroll from '../utils/hideBodyScroll'
import useEventCallback from './useEventCallback'
import useRefState from './useRefState'

export const enum PortalStatus {
  Mounted, // node appended to DOM
  Entering, // 2 animation frames after appended to DOM
  Entered, // animation complete
  Exiting, // closePortal was called
  Exited // initial state
}

export type PortalId =
  | 'spotlight'
  | 'expandedReflectionGroup'
  | 'phaseItemEditor'
  | 'snackbar'
  | 'githubFieldMenu'
  | 'editGitHubLabel'
  | 'azureDevOpsFieldMenu'
  | 'editAzureDevOpsLabel'
  | 'templateModal'
  | 'scaleDropdown'
  | 'sharingScopeDropdown'
  | 'StageTimerModal'
  | 'StageTimerEndTimePicker'
  | 'StageTimerStartTimePicker'
  | 'StageTimerMinutePicker'
  | 'taskFooterTeamAssigneeAddIntegration'
  | 'taskFooterTeamAssigneeMenu'
  | 'newMeetingRoot'
  | 'newMeetingRecurrenceSettings'
  | 'updateRecurrenceSettingsModal'
  | 'recurrenceStartTimePicker'
  | 'endRecurringMeetingModal'
  | 'templateTeamPickerModal'
  | 'reviewRequestToJoinOrgModal'
  | 'topBarNotificationsMenu'
  | 'pokerTemplateScaleDetailsModal'
  | 'activityDetailsRecurrenceSettings'

export interface UsePortalOptions {
  onOpen?: (el: HTMLElement) => void
  onClose?: () => void
  id?: PortalId
  // if you nest portals, this should be the id of the parent portal
  parentId?: PortalId
  // allow body to scroll while modal is open
  allowScroll?: boolean
  // ignore click, tap, and ESC handlers
  noClose?: boolean
}

const PortalContext = createContext<PortalId | undefined>(undefined)

const getParent = (parentId: string | undefined) => {
  const parent = parentId ? document.getElementById(parentId) : document.body
  if (!parent) throw new Error('Could not find parent ' + parentId)
  return parent
}

/**
 * Create and manage a React.Portal to display nodes outside the DOM. Manages Keyboard presses etc.
 * To nest multiple portals, the outer one should have id set and the inner one parentId
 */
const usePortal = (options: UsePortalOptions = {}) => {
  const portalRef = useRef<HTMLDivElement>()
  const originRef = useRef<HTMLElement>()
  const timeoutRef = useRef<number | null>(null)
  const showBodyScroll = useRef<() => void>()
  const [portalStatusRef, setPortalStatus] = useRefState(PortalStatus.Exited)
  const contextParentId = useContext(PortalContext)
  const parentId = options.parentId ?? contextParentId

  const terminatePortal = useEventCallback(() => {
    if (!portalRef.current) return
    document.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('mousedown', handleDocumentClick)
    document.removeEventListener('touchstart', handleDocumentClick)
    setPortalStatus(PortalStatus.Exited)
    try {
      getParent(parentId).removeChild(portalRef.current)
    } catch (e) {
      /* portal already removed (possible when parent is not document.body) */
    }
    portalRef.current = undefined
    showBodyScroll.current && showBodyScroll.current()
    timeoutRef.current = null
  })

  // terminate on unmount
  useEffect(() => terminatePortal, [terminatePortal])

  const terminateAfterTransition = useEventCallback(() => {
    // setTimeout because the portal should terminate only after all other transitionend events had time to fire
    timeoutRef.current = window.setTimeout(terminatePortal)
  })

  const closePortal = useEventCallback(() => {
    if (portalStatusRef.current >= PortalStatus.Exiting) return
    document.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('mousedown', handleDocumentClick)
    document.removeEventListener('touchstart', handleDocumentClick)
    if (portalRef.current) {
      portalRef.current.addEventListener('transitionend', terminateAfterTransition)
    }
    setPortalStatus(PortalStatus.Exiting)
    // important! this should be last in case the onClose also tries to close the portal (see EmojiMenu)
    options.onClose && options.onClose()
  })

  const handleKeydown = useEventCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      const children = Array.from(portalRef.current?.children ?? [])
      const hasChildModal = children.some((child) => child.id)
      if (hasChildModal) return
      const {activeElement, body} = document
      if (activeElement !== body && activeElement instanceof HTMLElement) {
        const {contentEditable, tagName} = activeElement
        // if viewer is typing something, don't close the portal on escape
        if (tagName === 'INPUT' || tagName === 'TEXTAREA' || contentEditable === 'true') {
          return
        }
      }
      // give focus back to the thing that opened it
      originRef.current?.focus()
      closePortal()
    }
  })

  const handleDocumentClick = useEventCallback((e: MouseEvent | TouchEvent) => {
    if (!portalRef.current) return
    const target = e.target as Node
    if (!portalRef.current.contains(target)) {
      // clicks on the toggle must be ignored, otherwise a long click where mouseup occurs after close will trigger a reopen
      if (!originRef.current || !originRef.current.contains(target)) {
        closePortal()
      }
    }
  })

  const openPortal = useEventCallback((e?: React.MouseEvent | React.TouchEvent) => {
    const {current: portalStatus} = portalStatusRef
    if (portalStatus <= PortalStatus.Entered) return

    if (!options.allowScroll) {
      showBodyScroll.current = hideBodyScroll()
    }
    if (!options.noClose) {
      document.addEventListener('keydown', handleKeydown)
      document.addEventListener('mousedown', handleDocumentClick)
      document.addEventListener('touchstart', handleDocumentClick)
    }
    if (portalStatus === PortalStatus.Exiting) {
      if (portalRef.current) {
        portalRef.current.removeEventListener('transitionend', terminateAfterTransition)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setPortalStatus(PortalStatus.Entered)
    } else if (portalStatus === PortalStatus.Exited) {
      setPortalStatus(PortalStatus.Mounted)
      // without rDAF: 1) coords may not be updated (if useCoords is used), 2) `enter` class hasn't had time to flush (if animations are used)
      requestDoubleAnimationFrame(() => {
        setPortalStatus(PortalStatus.Entering)
      })

      portalRef.current = document.createElement('div')
      portalRef.current.id = options.id || 'portal'
      getParent(parentId).appendChild(portalRef.current)
      if (e?.currentTarget) {
        originRef.current = e.currentTarget as HTMLElement
      }
      options.onOpen?.(portalRef.current)
    }
  })

  const togglePortal = useEventCallback((e?: React.MouseEvent | React.TouchEvent) => {
    portalRef.current ? closePortal() : openPortal(e)
  })

  const portal = useCallback(
    (reactEl: ReactNode) => {
      const targetEl = portalRef.current
      return !targetEl || portalStatusRef.current === PortalStatus.Exited
        ? null
        : createPortal(
            <PortalContext.Provider value={options.id}>{reactEl} </PortalContext.Provider>,
            targetEl
          )
    },
    [portalRef, portalStatusRef]
  )

  return {
    openPortal,
    closePortal,
    terminatePortal,
    togglePortal,
    portal,
    portalStatus: portalStatusRef.current,
    setPortalStatus
  }
}

export default usePortal
