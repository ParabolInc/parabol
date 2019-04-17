import {useMemo} from 'react'
import getBBox from 'universal/components/RetroReflectPhase/getBBox'
import useCoords, {MenuPosition} from 'universal/hooks/useCoords'
import useLoadingDelay from 'universal/hooks/useLoadingDelay'
import useMenuPortal from 'universal/hooks/useMenuPortal'
import usePortal, {UsePortalOptions} from 'universal/hooks/usePortal'

interface Options extends UsePortalOptions {}

const useMenu = (menuPosition: MenuPosition, options: Options = {}) => {
  const {onOpen, onClose} = options
  const {targetRef, originRef, coords} = useCoords(menuPosition)
  const {portal, closePortal, togglePortal, status} = usePortal({onOpen, onClose})
  const loadingWidth = useMemo(() => {
    const bbox = getBBox(originRef.current)
    return Math.max(40, bbox ? bbox.width : 40)
  }, [originRef.current])
  const {loadingDelay, loadingDelayRef} = useLoadingDelay()
  const menuPortal = useMenuPortal(portal, targetRef, loadingWidth, coords, status, loadingDelayRef)
  return {togglePortal, originRef, menuPortal, closePortal, loadingDelay, loadingWidth}
}

export default useMenu
