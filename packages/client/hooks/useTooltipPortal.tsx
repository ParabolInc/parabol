import {type ReactElement, type ReactNode, type ReactPortal, type RefObject, useEffect} from 'react'
import TooltipBackground from './TooltipBackground'
import type {UseCoordsValue} from './useCoords'
import {PortalStatus} from './usePortal'

const useTooltipPortal = (
  portal: (el: ReactElement) => ReactPortal | null,
  targetRef: RefObject<HTMLDivElement>,
  coords: UseCoordsValue,
  portalStatus: PortalStatus,
  setPortalStatus: (portalStatus: PortalStatus) => void
) => {
  useEffect(() => {
    let isMounted = true
    if (portalStatus === PortalStatus.Entering) {
      setTimeout(() => {
        if (isMounted) {
          setPortalStatus(PortalStatus.Entered)
        }
      })
    }
    return () => {
      isMounted = false
    }
  }, [portalStatus, setPortalStatus])
  return (reactEl: ReactNode) => {
    return portal(
      <div ref={targetRef} className='pointer-events-none absolute z-tooltip' style={{...coords}}>
        <TooltipBackground portalStatus={portalStatus}>{reactEl}</TooltipBackground>
      </div>
    )
  }
}

export default useTooltipPortal
