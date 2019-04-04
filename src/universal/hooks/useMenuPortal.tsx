import React, {ReactElement, ReactPortal, RefObject, Suspense} from 'react'
import styled from 'react-emotion'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent'
import MenuContents from 'universal/components/MenuContents'
import ModalError from 'universal/components/ModalError'
import getBBox from 'universal/components/RetroReflectPhase/getBBox'
import {UseCoordsValue} from 'universal/hooks/useCoords'
import {PortalState} from 'universal/hooks/usePortal'
import {ZIndex} from 'universal/types/constEnums'
import menuAnimations from 'universal/utils/menuAnimations'

const MenuBlock = styled('div')({
  marginTop: 8,
  marginBottom: 8,
  position: 'absolute',
  zIndex: ZIndex.MODAL
})

const useMenuPortal = (
  portal: (el: ReactElement) => ReactPortal | null,
  targetRef: (el: HTMLElement) => void,
  originRef: RefObject<HTMLElement>,
  coords: UseCoordsValue,
  status: PortalState
) => {
  const className = menuAnimations[status]
  return (reactEl) => {
    const bbox = getBBox(originRef.current)
    return portal(
      <MenuBlock innerRef={targetRef} style={{...coords}} className={className}>
        <ErrorBoundary fallback={(error) => <ModalError error={error} />}>
          <MenuContents>
            <Suspense
              fallback={
                <LoadingComponent
                  spinnerSize={24}
                  width={bbox ? bbox.width : 0}
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
