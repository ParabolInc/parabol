import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {MenuProps} from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import getMassInvitationUrl from '../utils/getMassInvitationUrl'
import {MeetingCardOptionsMenu_viewer} from '../__generated__/MeetingCardOptionsMenu_viewer.graphql'
import Icon from './Icon'
import Menu from './Menu'
import MenuItem from './MenuItem'
import {MenuItemLabelStyle} from './MenuItemLabel'

interface Props {
  menuProps: MenuProps
  popTooltip: () => void
  viewer: MeetingCardOptionsMenu_viewer
}

const StyledIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24,
  marginRight: 8
})

const OptionMenuItem = styled('div')({
  ...MenuItemLabelStyle,
  width: '200px'
})

const MeetingCardOptionsMenu = (props: Props) => {
  const {menuProps, popTooltip, viewer} = props
  const {team} = viewer

  const {massInvitation} = team!
  const {id: token} = massInvitation
  const copyUrl = getMassInvitationUrl(token)
  const {closePortal} = menuProps
  return (
    <Menu ariaLabel={'Edit the meeting'} {...menuProps}>
      <MenuItem
        key='copy'
        label={
          <OptionMenuItem>
            <StyledIcon>person_add</StyledIcon>
            <span>{'Copy invite link'}</span>
          </OptionMenuItem>
        }
        onClick={async () => {
          popTooltip()
          closePortal()
          await navigator.clipboard.writeText(copyUrl)
        }}
      />
    </Menu>
  )
}

export default createFragmentContainer(MeetingCardOptionsMenu, {
  viewer: graphql`
    fragment MeetingCardOptionsMenu_viewer on User {
      team(teamId: $teamId) {
        massInvitation(meetingId: $meetingId) {
          id
        }
      }
    }
  `
})
