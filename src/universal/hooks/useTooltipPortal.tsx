import React, {ReactElement, ReactPortal} from 'react'
import styled from '@emotion/styled'
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
