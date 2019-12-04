import React, {ReactElement, ReactPortal, RefObject} from 'react'
import styled from '@emotion/styled'
import TooltipBackground from './TooltipBackground'
import {UseCoordsValue} from './useCoords'
import {PortalStatus} from './usePortal'
import {ZIndex} from '../types/constEnums'

const TooltipBlock = styled('div')({
  position: 'absolute',
  zIndex: ZIndex.TOOLTIP
})

const useTooltipPortal = (
  portal: (el: ReactElement) => ReactPortal | null,
  targetRef: RefObject<HTMLDivElement>,
  coords: UseCoordsValue,
  portalStatus: PortalStatus
) => {
  return (reactEl) => {
    return portal(
      <TooltipBlock ref={targetRef as any} style={{...coords}}>
        <TooltipBackground portalStatus={portalStatus}>{reactEl}</TooltipBackground>
      </TooltipBlock>
    )
  }
}

export default useTooltipPortal
