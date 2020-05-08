import styled from '@emotion/styled'
import React from 'react'
import CardButton from '~/components/CardButton'
import IconLabel from '~/components/IconLabel'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import useTooltip from '~/hooks/useTooltip'
import TimelineEventFooterMenu from './TimelineEventFooterMenu'

const ButtonGroup = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end'
})

interface Props {
  timelineEventId: string
}

const TimelineEventFooterMenuToggle = (props: Props) => {
  const {timelineEventId} = props
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const {tooltipPortal, openTooltip, closeTooltip, originRef: tipRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )
  return (
    <ButtonGroup>
      <CardButton ref={originRef} onClick={togglePortal}>
        <IconLabel
          icon='more_vert'
          onMouseEnter={openTooltip}
          onMouseLeave={closeTooltip}
          onClick={closeTooltip}
          ref={tipRef}
        />
      </CardButton>
      {menuPortal(
        <TimelineEventFooterMenu menuProps={menuProps} timelineEventId={timelineEventId} />
      )}
      {tooltipPortal(<div>{'Set Status'}</div>)}
    </ButtonGroup>
  )
}

export default TimelineEventFooterMenuToggle
