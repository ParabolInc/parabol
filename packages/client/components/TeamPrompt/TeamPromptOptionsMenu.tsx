import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuProps} from '~/hooks/useMenu'
import useMutationProps from '~/hooks/useMutationProps'
import EndTeamPromptMutation from '~/mutations/EndTeamPromptMutation'
import StartRecurrenceMutation from '~/mutations/StartRecurrenceMutation'
import {ICON_SIZE} from '~/styles/typographyV2'
import {TeamPromptOptionsMenu_meeting$key} from '~/__generated__/TeamPromptOptionsMenu_meeting.graphql'
import {PALETTE} from '../../styles/paletteV3'
import Icon from '../Icon'
import Menu from '../Menu'
import MenuItem from '../MenuItem'
import {MenuItemLabelStyle} from '../MenuItemLabel'

const StyledIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24,
  marginRight: 8
})

const OptionMenuItem = styled('div')({
  ...MenuItemLabelStyle,
  width: '200px'
})

interface Props {
  meetingRef: TeamPromptOptionsMenu_meeting$key
  menuProps: MenuProps
}

const TeamPromptOptionsMenu = (props: Props) => {
  const {meetingRef, menuProps} = props

  const meeting = useFragment(
    graphql`
      fragment TeamPromptOptionsMenu_meeting on TeamPromptMeeting {
        id
        endedAt
      }
    `,
    meetingRef
  )

  const {id: meetingId, endedAt} = meeting
  const atmosphere = useAtmosphere()
  const {onCompleted, onError} = useMutationProps()

  return (
    <Menu ariaLabel={'Edit the meeting'} {...menuProps}>
      <MenuItem
        key='copy'
        isDisabled={!!endedAt}
        label={
          <OptionMenuItem>
            <StyledIcon>flag</StyledIcon>
            <span>{'End this activity'}</span>
          </OptionMenuItem>
        }
        onClick={() => {
          menuProps.closePortal()
          EndTeamPromptMutation(atmosphere, {meetingId}, {onCompleted, onError})
        }}
      />
      <MenuItem
        key='copy'
        isDisabled={!!endedAt}
        label={
          <OptionMenuItem>
            <StyledIcon>flag</StyledIcon>
            <span>{'Repeat M-F'}</span>
          </OptionMenuItem>
        }
        onClick={() => {
          menuProps.closePortal()
          StartRecurrenceMutation(atmosphere, {meetingId}, {onCompleted, onError})
        }}
      />
    </Menu>
  )
}

export default TeamPromptOptionsMenu
