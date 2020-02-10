import {useRef} from 'react'
import {Duration} from '../types/constEnums'
import useCoords, {MenuPosition} from './useCoords'
import useEventCallback from './useEventCallback'
import usePortal from './usePortal'
import useTooltipPortal from './useTooltipPortal'

interface Options {
  delay?: number
  disabled?: boolean
}

const useTooltip = <T extends HTMLElement = HTMLElement>(
  preferredMenuPosition: MenuPosition,
  options: Options = {}
) => {
  const delay = options.delay || Duration.TOOLTIP_DELAY
  const disabled = !!options.disabled
  const {portal, openPortal, closePortal, portalStatus, setPortalStatus} = usePortal()
  const {targetRef, originRef, coords} = useCoords<T>(preferredMenuPosition, {portalStatus})

  const tooltipPortal = useTooltipPortal(portal, targetRef, coords, portalStatus, setPortalStatus)
  const openDelayRef = useRef<number>()

  const openTooltip = useEventCallback(() => {
    if (disabled) return
    window.clearTimeout(openDelayRef.current)
    openDelayRef.current = window.setTimeout(() => {
      openPortal()
    }, delay)
  })

  const closeTooltip = useEventCallback(() => {
    window.clearTimeout(openDelayRef.current)
    closePortal()
  })
  return {
    openTooltip,
    closeTooltip,
    originRef,
    tooltipPortal
  }
}

export default useTooltip
