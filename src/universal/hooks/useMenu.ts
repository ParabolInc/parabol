import {useMemo} from 'react'
import getBBox, {RectElement} from 'universal/components/RetroReflectPhase/getBBox'
import useCoords, {MenuPosition, UseCoordsOptions} from 'universal/hooks/useCoords'
import useLoadingDelay from 'universal/hooks/useLoadingDelay'
import useMenuPortal from 'universal/hooks/useMenuPortal'
import usePortal, {UsePortalOptions} from 'universal/hooks/usePortal'

interface Options extends UsePortalOptions, UseCoordsOptions {
  loadingWidth?: number
  isDropdown?: boolean
}

const useMenu = (preferredMenuPosition: MenuPosition, options: Options = {}) => {
  const {onOpen, onClose, isDropdown, originCoords} = options
  const {targetRef, originRef, coords, menuPosition} = useCoords(preferredMenuPosition, {
    originCoords
  })
  if (originCoords) {
    (originRef as any).current = {getBoundingClientRect: () => originCoords} as RectElement
  }
  const {portal, closePortal, togglePortal, portalState, setPortalState} = usePortal({
    onOpen,
    onClose
  })
  const loadingWidth = useMemo(() => {
    if (options.loadingWidth) return options.loadingWidth
    const bbox = getBBox(originRef.current)
    return Math.max(40, bbox ? bbox.width : 40)
  }, [originRef.current])
  const {loadingDelay, loadingDelayRef} = useLoadingDelay()
  const menuPortal = useMenuPortal(
    portal,
    targetRef,
    loadingWidth,
    coords,
    portalState,
    setPortalState,
    !!isDropdown,
    menuPosition,
    loadingDelayRef
  )
  return {togglePortal, originRef, menuPortal, closePortal, portalState, loadingDelay, loadingWidth}
}

export default useMenu
