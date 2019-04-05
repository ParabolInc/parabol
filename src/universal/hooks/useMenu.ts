import useCoords, {MenuPosition} from 'universal/hooks/useCoords'
import useMenuPortal from 'universal/hooks/useMenuPortal'
import usePortal from 'universal/hooks/usePortal'

const useMenu = (menuPosition: MenuPosition) => {
  const {targetRef, originRef, coords} = useCoords(menuPosition)
  const {portal, closePortal, togglePortal, status} = usePortal()
  const menuPortal = useMenuPortal(portal, targetRef, originRef, coords, status)
  return {togglePortal, originRef, menuPortal, closePortal}
}

export default useMenu
