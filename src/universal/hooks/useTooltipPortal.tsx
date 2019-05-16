import React, {ReactElement, ReactPortal} from 'react'
import styled from 'react-emotion'
import TooltipBackground from 'universal/hooks/TooltipBackground'
import {UseCoordsValue} from 'universal/hooks/useCoords'
import {PortalStatus} from 'universal/hooks/usePortal'
import {ZIndex} from 'universal/types/constEnums'

const TooltipBlock = styled('div')({
  position: 'absolute',
  zIndex: ZIndex.MODAL
})

const useTooltipPortal = (
  portal: (el: ReactElement) => ReactPortal | null,
  targetRef: (el: HTMLElement) => void,
  coords: UseCoordsValue,
  portalStatus: PortalStatus
) => {
  return (reactEl) => {
    return portal(
      <TooltipBlock innerRef={targetRef} style={{...coords}}>
        <TooltipBackground portalStatus={portalStatus}>{reactEl}</TooltipBackground>
      </TooltipBlock>
    )
  }
}

export default useTooltipPortal
