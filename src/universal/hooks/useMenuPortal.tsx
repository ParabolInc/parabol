import React, {ReactElement, ReactPortal, Suspense} from 'react'
import styled from 'react-emotion'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent'
import MenuContents from 'universal/components/MenuContents'
import ModalError from 'universal/components/ModalError'
import MenuBackground from 'universal/hooks/MenuBackground'
import {MenuPosition, UseCoordsValue} from 'universal/hooks/useCoords'
import {LoadingDelayRef} from 'universal/hooks/useLoadingDelay'
import {PortalState} from 'universal/hooks/usePortal'
import {ZIndex} from 'universal/types/constEnums'

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
  status: PortalState,
  menuPosition: MenuPosition,
  loadingDelayRef: LoadingDelayRef
) => {
  return (reactEl) => {
    return portal(
      <MenuBlock innerRef={targetRef} style={{...coords}}>
        <MenuBackground menuPosition={menuPosition} status={status} />
        <ErrorBoundary fallback={(error) => <ModalError error={error} status={status} />}>
          <MenuContents minWidth={minWidth} status={status}>
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
