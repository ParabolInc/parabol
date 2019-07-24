import {useCallback, useRef} from 'react'
import useCoords, {MenuPosition} from './useCoords'
import useTooltipPortal from './useTooltipPortal'
import usePortal from './usePortal'
import {Duration} from '../types/constEnums'

interface Options {
  delay?: number
}

const useTooltip = (preferredMenuPosition: MenuPosition, options: Options = {}) => {
  const delay = options.delay || Duration.TOOLTIP_DELAY
  const {targetRef, originRef, coords} = useCoords(preferredMenuPosition)
  const {portal, openPortal, closePortal, portalStatus} = usePortal()
  const tooltipPortal = useTooltipPortal(portal, targetRef, coords, portalStatus)
  const openDelayRef = useRef<number>()

  const openTooltip = useCallback(() => {
    openDelayRef.current = window.setTimeout(() => {
      openPortal()
    }, delay)
  }, [delay])

  const closeTooltip = useCallback(() => {
    window.clearTimeout(openDelayRef.current)
    closePortal()
  }, [])

  return {
    openTooltip,
    closeTooltip,
    originRef,
    tooltipPortal
  }
}

export default useTooltip
