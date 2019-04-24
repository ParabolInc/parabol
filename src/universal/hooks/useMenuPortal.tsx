import React, {ReactElement, ReactPortal, Suspense} from 'react'
import styled from 'react-emotion'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent'
import MenuContents from 'universal/components/MenuContents'
import ModalError from 'universal/components/ModalError'
import {MenuPosition, UseCoordsValue} from 'universal/hooks/useCoords'
import {LoadingDelayRef} from 'universal/hooks/useLoadingDelay'
import {PortalState} from 'universal/hooks/usePortal'
import {menuShadow} from 'universal/styles/elevation'
import {ZIndex} from 'universal/types/constEnums'
import menuAnimations from 'universal/utils/menuAnimations'

const MenuBlock = styled('div')({
  // no margins or paddings since they could force it too low & cause a scrollbar to appear
  position: 'absolute',
  zIndex: ZIndex.MODAL
})

const transformOrigins = {
  [MenuPosition.UPPER_RIGHT]: 'top right',
  [MenuPosition.UPPER_LEFT]: 'top left',
  [MenuPosition.LOWER_LEFT]: 'bottom left',
  [MenuPosition.LOWER_RIGHT]: 'bottom right'
}

const Background = styled('div')(({menuPosition}: {menuPosition: MenuPosition}) => ({
  background: '#fff',
  borderRadius: '2px',
  boxShadow: menuShadow,
  height: '100%',
  position: 'absolute',
  transformOrigin: transformOrigins[menuPosition],
  width: '100%',
  zIndex: -1
}))

const useMenuPortal = (
  portal: (el: ReactElement) => ReactPortal | null,
  targetRef: (el: HTMLElement) => void,
  loadingWidth: number,
  coords: UseCoordsValue,
  status: PortalState,
  menuPosition: MenuPosition,
  loadingDelayRef: LoadingDelayRef
) => {
  return (reactEl) => {
    return portal(
      <MenuBlock innerRef={targetRef} style={{...coords}}>
        <Background menuPosition={menuPosition} className={menuAnimations[status]} />
        <ErrorBoundary fallback={(error) => <ModalError error={error} status={status} />}>
          <MenuContents status={status}>
            <Suspense
              fallback={
                <LoadingComponent
                  loadingDelayRef={loadingDelayRef}
                  spinnerSize={24}
                  width={loadingWidth}
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
