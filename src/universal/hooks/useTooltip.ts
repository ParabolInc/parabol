import {useMemo} from 'react'
import getBBox, {RectElement} from 'universal/components/RetroReflectPhase/getBBox'
import useCoords, {MenuPosition, UseCoordsOptions} from 'universal/hooks/useCoords'
import useTooltipPortal from 'universal/hooks/useTooltipPortal'
import usePortal, {PortalStatus, UsePortalOptions} from 'universal/hooks/usePortal'

interface Options extends UsePortalOptions, UseCoordsOptions {
  loadingWidth?: number
}

export interface TooltipProps {
  openPortal: () => void
  closePortal: () => void
  portalStatus: PortalStatus
}

const useTooltip = (preferredMenuPosition: MenuPosition, options: Options = {}) => {
  const {onOpen, onClose, originCoords} = options
  const {targetRef, originRef, coords} = useCoords(preferredMenuPosition, {
    originCoords
  })
  if (originCoords) {
    (originRef as any).current = {getBoundingClientRect: () => originCoords} as RectElement
  }
  const {portal, openPortal, closePortal, togglePortal, portalStatus} = usePortal({
    onOpen,
    onClose
  })
  const loadingWidth = useMemo(() => {
    if (options.loadingWidth) return options.loadingWidth
    const bbox = getBBox(originRef.current)
    return Math.max(40, bbox ? bbox.width : 40)
  }, [originRef.current])
  const tooltipPortal = useTooltipPortal(portal, targetRef, loadingWidth, coords, portalStatus)
  const tooltipProps = {portalStatus, openPortal, closePortal}
  return {
    openPortal,
    closePortal,
    togglePortal,
    originRef,
    tooltipPortal,
    tooltipProps
  }
}

export default useTooltip
