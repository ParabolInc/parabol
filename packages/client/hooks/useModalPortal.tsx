import {
  type ReactElement,
  type ReactNode,
  type ReactPortal,
  type Ref,
  Suspense,
  useEffect
} from 'react'
import ErrorBoundary from '../components/ErrorBoundary'
import LoadingComponent from '../components/LoadingComponent/LoadingComponent'
import ModalError from '../components/ModalError'
import {Duration} from '../types/constEnums'
import {cn} from '../ui/cn'
import type {LoadingDelayRef} from './useLoadingDelay'
import type usePortal from './usePortal'
import {PortalStatus} from './usePortal'

const backdropClasses = {
  [PortalStatus.Entering]: 'opacity-100 transition-opacity duration-200 ease-out',
  [PortalStatus.Exiting]: 'opacity-0 transition-opacity duration-[120ms] ease-out',
  [PortalStatus.Mounted]: 'opacity-0'
} as const

const modalClasses = {
  [PortalStatus.Mounted]: 'opacity-0 [transform:translateY(32px)]',
  [PortalStatus.Entering]:
    'opacity-100 [transform:translateY(0)] transition-[transform,opacity] duration-200 ease-out',
  [PortalStatus.Exiting]:
    'opacity-0 [transform:translateY(-32px)] transition-[transform,opacity] duration-[120ms] ease-out'
} as const

const useModalPortal = (
  portal: (el: ReactElement) => ReactPortal | null,
  targetRef: Ref<HTMLDivElement>,
  portalStatus: PortalStatus,
  setPortalStatus: ReturnType<typeof usePortal>['setPortalStatus'],
  loadingDelayRef: LoadingDelayRef,
  closePortal: undefined | (() => void),
  background: string | undefined,
  backdropFilter?: string | undefined
) => {
  useEffect(() => {
    let isMounted = true
    if (portalStatus === PortalStatus.Entering) {
      setTimeout(() => {
        if (isMounted) {
          setPortalStatus(PortalStatus.Entered)
        }
      }, Duration.MODAL_OPEN)
    }
    return () => {
      isMounted = false
    }
  }, [portalStatus, setPortalStatus])
  return (reactEl: ReactNode) => {
    return portal(
      <div
        ref={targetRef}
        className='fixed top-0 left-0 z-dialog flex h-full w-full items-center justify-center overflow-scroll'
      >
        <div className='fixed h-full w-full' style={{backdropFilter}}>
          <div
            onClick={closePortal}
            className={cn(
              'fixed h-full w-full bg-slate-700/30',
              backdropClasses[portalStatus as keyof typeof backdropClasses]
            )}
            style={background ? {background} : undefined}
          />
        </div>
        <div
          className={cn(
            'relative my-auto flex flex-initial flex-col',
            modalClasses[portalStatus as keyof typeof modalClasses]
          )}
        >
          <ErrorBoundary
            fallback={(error, eventId) => (
              <ModalError error={error} portalStatus={portalStatus} eventId={eventId} />
            )}
          >
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
          </ErrorBoundary>
        </div>
      </div>
    )
  }
}

export default useModalPortal
