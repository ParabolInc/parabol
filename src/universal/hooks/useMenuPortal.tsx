import React, {ReactElement, ReactPortal, Suspense, useEffect} from 'react'
import styled from '@emotion/styled'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent'
import Menu from 'universal/components/Menu'
import MenuContents from 'universal/components/MenuContents'
import ModalError from 'universal/components/ModalError'
import MenuBackground from 'universal/hooks/MenuBackground'
import {MenuPosition, UseCoordsValue} from 'universal/hooks/useCoords'
import {LoadingDelayRef} from 'universal/hooks/useLoadingDelay'
import {PortalStatus} from 'universal/hooks/usePortal'
import {Duration, ZIndex} from 'universal/types/constEnums'

const MenuBlock = styled('div')({
  // no margins or paddings since they could force it too low & cause a scrollbar to appear
  position: 'absolute',
  zIndex: ZIndex.MODAL
})


const useMenuPortal = (
  portal: (el: ReactElement) => ReactPortal | null,
  targetRef: (el: HTMLDivElement | null) => void,
  minWidth: number,
  coords: UseCoordsValue,
  portalStatus: PortalStatus,
  setPortalStatus: any,
  isDropdown: boolean,
  menuPosition: MenuPosition,
  loadingDelayRef: LoadingDelayRef
) => {
  useEffect(() => {
    let isMounted = true
    if (portalStatus === PortalStatus.Entering) {
      setTimeout(() => {
        if (isMounted) {
          setPortalStatus(PortalStatus.Entered)
        }
      }, Duration.MENU_OPEN_MAX)
    }
    return () => {
      isMounted = false
    }
  }, [portalStatus])
  return (reactEl) => {
    return portal(
      <MenuBlock ref={targetRef as any} style={{...coords}}>
        <MenuBackground
          menuPosition={menuPosition}
          portalStatus={portalStatus}
          isDropdown={isDropdown}
        />
        <ErrorBoundary
          fallback={(error) => (
            <Menu ariaLabel='Error' closePortal={undefined as any} portalStatus={portalStatus}>
              <ModalError error={error} portalStatus={portalStatus} />
            </Menu>
          )}
        >
          <MenuContents minWidth={minWidth} portalStatus={portalStatus}>
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
