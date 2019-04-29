import React, {ReactElement, ReactPortal, Suspense, useEffect} from 'react'
import styled from 'react-emotion'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent'
import Menu from 'universal/components/Menu'
import MenuContents from 'universal/components/MenuContents'
import ModalError from 'universal/components/ModalError'
import MenuBackground from 'universal/hooks/MenuBackground'
import {MenuPosition, UseCoordsValue} from 'universal/hooks/useCoords'
import {LoadingDelayRef} from 'universal/hooks/useLoadingDelay'
import {PortalState} from 'universal/hooks/usePortal'
import {Duration, ZIndex} from 'universal/types/constEnums'

const MenuBlock = styled('div')({
  // no margins or paddings since they could force it too low & cause a scrollbar to appear
  position: 'absolute',
  zIndex: ZIndex.MODAL
})

const useMenuPortal = (
  portal: (el: ReactElement) => ReactPortal | null,
  targetRef: (el: HTMLElement) => void,
  minWidth: number,
  coords: UseCoordsValue,
  portalState: PortalState,
  setPortalState: any,
  isDropdown: boolean,
  menuPosition: MenuPosition,
  loadingDelayRef: LoadingDelayRef
) => {
  useEffect(() => {
    let isMounted = true
    if (portalState === PortalState.Entered) {
      setTimeout(() => {
        if (isMounted) {
          setPortalState(PortalState.AnimatedIn)
        }
      }, Duration.MENU_OPEN_MAX)
    }
    return () => {
      isMounted = false
    }
  }, [portalState])
  return (reactEl) => {
    return portal(
      <MenuBlock innerRef={targetRef} style={{...coords}}>
        <MenuBackground
          menuPosition={menuPosition}
          portalState={portalState}
          isDropdown={isDropdown}
        />
        <ErrorBoundary
          fallback={(error) => (
            <Menu ariaLabel='Error' closePortal={undefined as any} portalState={portalState}>
              <ModalError error={error} portalState={portalState} />
            </Menu>
          )}
        >
          <MenuContents minWidth={minWidth} portalState={portalState}>
            <Suspense
              fallback={
                <LoadingComponent
                  loadingDelayRef={loadingDelayRef}
                  spinnerSize={24}
                  width={minWidth}
                  height={24}
                  showAfter={0}
                />
              }
            >
              {reactEl}
            </Suspense>
          </MenuContents>
        </ErrorBoundary>
      </MenuBlock>
    )
  }
}

export default useMenuPortal
