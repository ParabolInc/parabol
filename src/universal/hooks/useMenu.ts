import useCoords, {MenuPosition} from 'universal/hooks/useCoords'
import useMenuPortal from 'universal/hooks/useMenuPortal'
import usePortal, {UsePortalOptions} from 'universal/hooks/usePortal'

interface Options extends UsePortalOptions {}

const useMenu = (menuPosition: MenuPosition, options: Options = {}) => {
  const {onOpen, onClose} = options
  const {targetRef, originRef, coords} = useCoords(menuPosition)
  const {portal, closePortal, togglePortal, status} = usePortal({onOpen, onClose})
  const menuPortal = useMenuPortal(portal, targetRef, originRef, coords, status)
  return {togglePortal, originRef, menuPortal, closePortal}
}

export default useMenu
