import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import useMutationProps from '~/hooks/useMutationProps'
import EndTeamPromptMutation from '~/mutations/EndTeamPromptMutation'
import {ICON_SIZE} from '~/styles/typographyV2'
import {TeamPromptOptionsMenu_meeting$key} from '~/__generated__/TeamPromptOptionsMenu_meeting.graphql'
import {PALETTE} from '../../styles/paletteV3'
import CardButton from '../CardButton'
import Icon from '../Icon'
import IconLabel from '../IconLabel'
import Menu from '../Menu'
import MenuItem from '../MenuItem'
import {MenuItemLabelStyle} from '../MenuItemLabel'

const Options = styled(CardButton)({
  position: 'absolute',
  top: 0,
  right: 0,
  color: PALETTE.SLATE_700,
  height: 32,
  width: 32,
  opacity: 1,
  ':hover': {
    backgroundColor: PALETTE.SLATE_300
  }
})

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
  meeting: TeamPromptOptionsMenu_meeting$key
}

const TeamPromptOptionsMenu = (props: Props) => {
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)

  const {meeting: meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment TeamPromptOptionsMenu_meeting on TeamPromptMeeting {
        id
      }
    `,
    meetingRef
  )

  const {id: meetingId} = meeting
  const atmosphere = useAtmosphere()
  const {onCompleted, onError} = useMutationProps()

  const renderedMenu = (
    <Menu ariaLabel={'Edit the meeting'} {...menuProps}>
      <MenuItem
        key='copy'
        label={
          <OptionMenuItem>
            <StyledIcon>flag</StyledIcon>
            <span>{'End this activity'}</span>
          </OptionMenuItem>
        }
        onClick={async () => {
          menuProps.closePortal()
          EndTeamPromptMutation(atmosphere, {meetingId}, {onCompleted, onError})
        }}
      />
    </Menu>
  )

  return (
    <>
      <Options ref={originRef} onClick={togglePortal}>
        <IconLabel ref={originRef} icon='more_vert' />
      </Options>
      {menuPortal(renderedMenu)}
    </>
  )
}

export default TeamPromptOptionsMenu
