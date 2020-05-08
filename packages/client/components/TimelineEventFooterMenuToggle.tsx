import React from 'react'
import useTooltip from 'hooks/useTooltip'
import useMenu from 'hooks/useMenu'
import {MenuPosition} from 'hooks/useCoords'
import CardButton from 'components/CardButton'
import IconLabel from 'components/IconLabel'
import styled from '@emotion/styled'
import TimelineEventFooterMenu from './TimelineEventFooterMenu'

const ButtonGroup = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end'
})

interface Props {
  timelineEventId: string
  meetingId: string
  teamId: string
}

const TimelineEventFooterMenuToggle = (props: Props) => {
  const {timelineEventId, meetingId, teamId} = props
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
        <TimelineEventFooterMenu
          menuProps={menuProps}
          timelineEventId={timelineEventId}
          meetingId={meetingId}
          teamId={teamId}
        />
      )}
      {tooltipPortal(<div>{'Set Status'}</div>)}
    </ButtonGroup>
  )
}

export default TimelineEventFooterMenuToggle
