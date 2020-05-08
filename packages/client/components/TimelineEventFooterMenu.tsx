import {MenuProps} from 'hooks/useMenu'
import Menu from 'components/Menu'
import React from 'react'
import styled from '@emotion/styled'
import MenuItem from 'components/MenuItem'
import useAtmosphere from 'hooks/useAtmosphere'
import {MenuItemLabelStyle} from './MenuItemLabel'
import {PALETTE} from 'styles/paletteV2'
import ArchiveTimelineEventMutation from 'mutations/ArchiveTimelineEventMutation'
import {ICON_SIZE} from 'styles/typographyV2'
import Icon from './Icon'

interface Props {
  menuProps: MenuProps
  timelineEventId: string
  meetingId: string
  teamId: string
}

const StyledIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD24,
  marginRight: 8
})

const TimelineEventMenuItemLabel = styled('div')({
  ...MenuItemLabelStyle,
  width: '200px'
})

const TimelineEventFooterMenu = (props: Props) => {
  const {menuProps, ...mutationParameters} = props
  const atmosphere = useAtmosphere()
  return (
    <Menu ariaLabel={'Change the status of the timeline event'} {...menuProps}>
      <MenuItem
        key='archive'
        label={
          <TimelineEventMenuItemLabel>
            <StyledIcon>archive</StyledIcon>
            <span>{'Archive meeting'}</span>
          </TimelineEventMenuItemLabel>
        }
        onClick={() => ArchiveTimelineEventMutation(atmosphere, mutationParameters)}
      />
    </Menu>
  )
}

export default TimelineEventFooterMenu
