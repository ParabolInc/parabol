import React, {ReactElement, ReactPortal, Ref, Suspense} from 'react'
import styled from 'react-emotion'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent'
import ModalError from 'universal/components/ModalError'
import {LoadingDelayRef} from 'universal/hooks/useLoadingDelay'
import {PortalState} from 'universal/hooks/usePortal'
import {DECELERATE} from 'universal/styles/animation'
import {modalShadow} from 'universal/styles/elevation'
import {PALETTE} from 'universal/styles/paletteV2'
import {Duration, ZIndex} from 'universal/types/constEnums'

const ModalBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  height: '100%',
  justifyContent: 'center',
  left: 0,
  // no margins or paddings since they could force it too low & cause a scrollbar to appear
  position: 'absolute',
  top: 0,
  width: '100%',
  zIndex: ZIndex.MODAL
})

const backdropStyles = {
  [PortalState.Entered]: {
    opacity: 1,
    transition: `opacity ${Duration.MODAL_OPEN}ms ${DECELERATE}`
  },
  [PortalState.Exiting]: {
    opacity: 0,
    transition: `opacity ${Duration.PORTAL_CLOSE}ms ${DECELERATE}`
  },
  [PortalState.Entering]: {
    opacity: 0
  }
}

const modalStyles = {
  [PortalState.Entered]: {
    opacity: 1,
    transform: 'translateY(0)',
    transition: `all ${Duration.MODAL_OPEN}ms ${DECELERATE}`
  },
  [PortalState.Exiting]: {
    opacity: 0,
    transform: 'translateY(-32px)',
    transition: `all ${Duration.PORTAL_CLOSE}ms ${DECELERATE}`
  },
  [PortalState.Entering]: {
    opacity: 0,
    transform: 'translateY(32px)'
  }
}
const Backdrop = styled('div')(
  ({background, status}: {background: string; status: PortalState}) => ({
    background,
    height: '100%',
    position: 'fixed',
    width: '100%',
    ...backdropStyles[status]
  })
)

const ModalContents = styled('div')(({status}: {status: PortalState}) => ({
  boxShadow: modalShadow,
  display: 'flex',
  flex: '0 1 auto',
  flexDirection: 'column',
  maxHeight: '90vh',
  position: 'relative',
  ...modalStyles[status]
}))

const useModalPortal = (
  portal: (el: ReactElement) => ReactPortal | null,
  targetRef: Ref<HTMLDivElement>,
  loadingWidth: number,
  status: PortalState,
  loadingDelayRef: LoadingDelayRef,
  closePortal: () => void,
  background: string | undefined
) => {
  return (reactEl) => {
    return portal(
      <ModalBlock innerRef={targetRef}>
        <Backdrop
          onClick={closePortal}
          background={background || PALETTE.BACKGROUND.BACKDROP}
          status={status}
        />
        <ErrorBoundary fallback={(error) => <ModalError error={error} status={status} />}>
          <ModalContents status={status}>
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
          </ModalContents>
        </ErrorBoundary>
      </ModalBlock>
    )
  }
}

export default useModalPortal
