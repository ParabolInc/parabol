import {useRef} from 'react'
import useCoords, {MenuPosition} from './useCoords'
import useTooltipPortal from './useTooltipPortal'
import usePortal from './usePortal'
import {Duration} from '../types/constEnums'
import useEventCallback from './useEventCallback'

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
  const {portal, openPortal, closePortal, portalStatus} = usePortal()
  const {targetRef, originRef, coords} = useCoords<T>(preferredMenuPosition, {portalStatus})

  const tooltipPortal = useTooltipPortal(portal, targetRef, coords, portalStatus)
  const openDelayRef = useRef<number>()

  const openTooltip = useEventCallback(() => {
    if (disabled) return
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
