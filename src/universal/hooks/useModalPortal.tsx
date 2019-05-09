import React, {ReactElement, ReactPortal, Ref, Suspense} from 'react'
import styled from 'react-emotion'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent'
import ModalError from 'universal/components/ModalError'
import {LoadingDelayRef} from 'universal/hooks/useLoadingDelay'
import {PortalStatus} from 'universal/hooks/usePortal'
import {DECELERATE} from 'universal/styles/animation'
import {PALETTE} from 'universal/styles/paletteV2'
import {Duration, ZIndex} from 'universal/types/constEnums'

const ModalBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  height: '100%',
  justifyContent: 'center',
  left: 0,
  // no margins or paddings since they could force it too low & cause a scrollbar to appear
  maxHeight: '100%',
  maxWidth: '100%',
  position: 'absolute',
  top: 0,
  width: '100%',
  zIndex: ZIndex.MODAL
})

const backdropStyles = {
  [PortalStatus.Entered]: {
    opacity: 1,
    transition: `opacity ${Duration.MODAL_OPEN}ms ${DECELERATE}`
  },
  [PortalStatus.Exiting]: {
    opacity: 0,
    transition: `opacity ${Duration.PORTAL_CLOSE}ms ${DECELERATE}`
  },
  [PortalStatus.Entering]: {
    opacity: 0
  }
}

const modalStyles = {
  [PortalStatus.Entered]: {
    opacity: 1,
    transform: 'translateY(0)',
    transition: `all ${Duration.MODAL_OPEN}ms ${DECELERATE}`
  },
  [PortalStatus.Exiting]: {
    opacity: 0,
    transform: 'translateY(-32px)',
    transition: `all ${Duration.PORTAL_CLOSE}ms ${DECELERATE}`
  },
  [PortalStatus.Entering]: {
    opacity: 0,
    transform: 'translateY(32px)'
  }
}
const Backdrop = styled('div')(
  ({background, portalStatus}: {background: string; portalStatus: PortalStatus}) => ({
    background,
    height: '100%',
    position: 'fixed',
    width: '100%',
    ...backdropStyles[portalStatus]
  })
)

const ModalContents = styled('div')(({portalStatus}: {portalStatus: PortalStatus}) => ({
  display: 'flex',
  flex: '0 1 auto',
  flexDirection: 'column',
  position: 'relative',
  ...modalStyles[portalStatus]
}))

const useModalPortal = (
  portal: (el: ReactElement) => ReactPortal | null,
  targetRef: Ref<HTMLDivElement>,
  portalStatus: PortalStatus,
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
          portalStatus={portalStatus}
        />
        <ErrorBoundary
          fallback={(error) => <ModalError error={error} portalStatus={portalStatus} />}
        >
          <ModalContents portalStatus={portalStatus}>
            <Suspense
              fallback={
                <LoadingComponent
                  loadingDelayRef={loadingDelayRef}
                  spinnerSize={24}
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
