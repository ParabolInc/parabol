import React, {ReactElement, ReactPortal, useEffect} from 'react'
import styled from 'react-emotion'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import Menu from 'universal/components/Menu'
import ModalError from 'universal/components/ModalError'
import TooltipBackground from 'universal/hooks/TooltipBackground'
import {UseCoordsValue} from 'universal/hooks/useCoords'
import {PortalStatus} from 'universal/hooks/usePortal'
import {Duration, ZIndex} from 'universal/types/constEnums'

const TooltipBlock = styled('div')({
  // no margins or paddings since they could force it too low & cause a scrollbar to appear
  position: 'absolute',
  zIndex: ZIndex.MODAL
})

const useTooltipPortal = (
  portal: (el: ReactElement) => ReactPortal | null,
  targetRef: (el: HTMLElement) => void,
  minWidth: number,
  coords: UseCoordsValue,
  portalStatus: PortalStatus,
  setPortalStatus: any
) => {
  useEffect(() => {
    let isMounted = true
    if (portalStatus === PortalStatus.Entered) {
      setTimeout(() => {
        if (isMounted) {
          setPortalStatus(PortalStatus.AnimatedIn)
        }
      }, Duration.TOOLTIP_OPEN_DELAY)
    }
    return () => {
      isMounted = false
    }
  }, [portalStatus])
  return (reactEl) => {
    return portal(
      <TooltipBlock innerRef={targetRef} style={{...coords}}>
        <ErrorBoundary
          fallback={(error) => (
            <Menu ariaLabel='Error' closePortal={undefined as any} portalStatus={portalStatus}>
              <ModalError error={error} portalStatus={portalStatus} />
            </Menu>
          )}
        >
          <TooltipBackground minWidth={minWidth} portalStatus={portalStatus}>
            {reactEl}
          </TooltipBackground>
        </ErrorBoundary>
      </TooltipBlock>
    )
  }
}

export default useTooltipPortal
