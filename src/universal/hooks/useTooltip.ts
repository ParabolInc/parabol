import {useCallback, useRef} from 'react'
import useCoords, {MenuPosition} from 'universal/hooks/useCoords'
import useTooltipPortal from 'universal/hooks/useTooltipPortal'
import usePortal from 'universal/hooks/usePortal'

interface Options {
  delay?: number
}

const useTooltip = (preferredMenuPosition: MenuPosition, options: Options = {}) => {
  const delay = options.delay || 0
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
