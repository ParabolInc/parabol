import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import EndTeamPromptMutation from '~/mutations/EndTeamPromptMutation'
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
  const {team, meeting} = viewer
  const {massInvitation} = team!
  const {id: token} = massInvitation
  const isTeamPrompt = meeting?.meetingType === 'teamPrompt'
  const atmosphere = useAtmosphere()
  const {onCompleted, onError} = useMutationProps()

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
          const copyUrl = getMassInvitationUrl(token)
          await navigator.clipboard.writeText(copyUrl)
        }}
      />
      {isTeamPrompt && (
        <MenuItem
          key='close'
          label={
            <OptionMenuItem>
              <StyledIcon>close</StyledIcon>
              <span>{'End the meeting'}</span>
            </OptionMenuItem>
          }
          onClick={() => {
            popTooltip()
            closePortal()
            EndTeamPromptMutation(atmosphere, {meetingId: meeting.id}, {onError, onCompleted})
          }}
        />
      )}
    </Menu>
  )
}

export default createFragmentContainer(MeetingCardOptionsMenu, {
  viewer: graphql`
    fragment MeetingCardOptionsMenu_viewer on User {
      meeting(meetingId: $meetingId) {
        id
        meetingType
      }
      team(teamId: $teamId) {
        massInvitation(meetingId: $meetingId) {
          id
        }
      }
    }
  `
})
