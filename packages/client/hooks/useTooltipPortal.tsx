import styled from '@emotion/styled'
import React, {ReactElement, ReactNode, ReactPortal, RefObject, useEffect} from 'react'
import {ZIndex} from '../types/constEnums'
import TooltipBackground from './TooltipBackground'
import {UseCoordsValue} from './useCoords'
import {PortalStatus} from './usePortal'

const TooltipBlock = styled('div')({
  position: 'absolute',
  zIndex: ZIndex.TOOLTIP,
  pointerEvents: 'none'
})

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
      <TooltipBlock ref={targetRef as any} style={{...coords}}>
        <TooltipBackground portalStatus={portalStatus}>{reactEl}</TooltipBackground>
      </TooltipBlock>
    )
  }
}

export default useTooltipPortal
