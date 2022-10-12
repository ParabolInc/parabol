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
      portalStatus === PortalStatus.Mounted ||
      portalStatus === PortalStatus.Entering ||
      portalStatus === PortalStatus.Entered
    ) {
      setTopOffset(cardContainerRef?.current?.scrollTop || 0)
    }
    return (coords as {right: number; top: number}).top
      ? {
          ...coords,
          top: (coords as {right: number; top: number}).top - 64 + topOffset
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
