import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {usePreloadedQuery, PreloadedQuery} from 'react-relay'
import {MenuProps} from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import getMassInvitationUrl from '../utils/getMassInvitationUrl'
import Icon from './Icon'
import Menu from './Menu'
import MenuItem from './MenuItem'
import {MenuItemLabelStyle} from './MenuItemLabel'
import {MeetingCardOptionsMenuQuery} from '../__generated__/MeetingCardOptionsMenuQuery.graphql'

interface Props {
  menuProps: MenuProps
  popTooltip: () => void
  queryRef: PreloadedQuery<MeetingCardOptionsMenuQuery>
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

const query = graphql`
  query MeetingCardOptionsMenuQuery($teamId: ID!, $meetingId: ID) {
    viewer {
      team(teamId: $teamId) {
        massInvitation(meetingId: $meetingId) {
          id
        }
      }
    }
  }
`

const MeetingCardOptionsMenu = (props: Props) => {
  const {menuProps, popTooltip, queryRef} = props
  const data = usePreloadedQuery<MeetingCardOptionsMenuQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
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

export default MeetingCardOptionsMenu
