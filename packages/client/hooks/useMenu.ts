import {RefObject, useMemo, useState} from 'react'
import getBBox, {RectElement} from '../components/RetroReflectPhase/getBBox'
import useCoords, {MenuPosition, UseCoordsOptions} from './useCoords'
import useLoadingDelay from './useLoadingDelay'
import useMenuPortal from './useMenuPortal'
import usePortal, {PortalStatus, UsePortalOptions} from './usePortal'

interface Options extends UsePortalOptions, UseCoordsOptions {
  loadingWidth?: number
  isDropdown?: boolean
  menuContentStyles?: any
  menuContentRef?: RefObject<HTMLDivElement>
  cardContainerRef?: RefObject<HTMLDivElement>
}

export interface MenuProps {
  closePortal: () => void
  portalStatus: PortalStatus
  isDropdown: boolean
}

const TOP_POSITION_EXCESS = 64

/**
 * Wrapper around {@link usePortal} to display menus
 */
const useMenu = <T extends HTMLElement = HTMLButtonElement>(
  preferredMenuPosition: MenuPosition,
  options: Options = {}
) => {
  const {
    onOpen,
    onClose,
    id,
    parentId,
    originCoords,
    menuContentStyles,
    menuContentRef,
    cardContainerRef
  } = options
  const isDropdown = !!options.isDropdown
  const {targetRef, originRef, coords, menuPosition} = useCoords<T>(preferredMenuPosition, {
    originCoords
  })
  if (originCoords) {
    ;(originRef as any).current = {getBoundingClientRect: () => originCoords} as RectElement
  }
  const {
    portal,
    closePortal,
    openPortal,
    portalStatus,
    terminatePortal,
    togglePortal,
    setPortalStatus
  } = usePortal({
    id,
    onOpen,
    onClose,
    parentId
  })
  const loadingWidth = useMemo(() => {
    if (options.loadingWidth) return options.loadingWidth
    const bbox = getBBox(originRef.current)
    return Math.max(40, bbox ? bbox.width : 40)
  }, [originRef.current /* eslint-disable-line react-hooks/exhaustive-deps */])
  const {loadingDelay, loadingDelayRef} = useLoadingDelay()

  const [topOffset, setTopOffset] = useState<number>(0)

  const menuCoords = useMemo(() => {
    if (
      [PortalStatus.Mounted, PortalStatus.Entering, PortalStatus.Entered].includes(portalStatus)
    ) {
      setTopOffset((cardContainerRef?.current?.scrollTop || 0) - TOP_POSITION_EXCESS)
    }
    return 'top' in coords
      ? {
          ...coords,
          top: coords.top + topOffset
        }
      : coords
  }, [coords, portalStatus])

  const menuPortal = useMenuPortal(
    portal,
    targetRef,
    loadingWidth,
    menuCoords,
    portalStatus,
    setPortalStatus,
    isDropdown,
    menuPosition,
    loadingDelayRef,
    menuContentStyles,
    menuContentRef
  )
  const menuProps = {portalStatus, closePortal, isDropdown}
  return {
    loadingDelay,
    loadingWidth,
    menuPortal,
    menuProps,
    openPortal,
    originRef,
    portalStatus,
    terminatePortal,
    togglePortal
  }
}

export default useMenu
