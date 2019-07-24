import React, {ReactElement, ReactPortal} from 'react'
import styled from '@emotion/styled'
import TooltipBackground from './TooltipBackground'
import {UseCoordsValue} from './useCoords'
import {PortalStatus} from './usePortal'
import {ZIndex} from '../types/constEnums'

const TooltipBlock = styled('div')({
  position: 'absolute',
  zIndex: ZIndex.MODAL
})

const useTooltipPortal = (
  portal: (el: ReactElement) => ReactPortal | null,
  targetRef: (el: HTMLDivElement | null) => void,
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
