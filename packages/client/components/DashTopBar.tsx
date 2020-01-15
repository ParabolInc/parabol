import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from 'styles/paletteV2'
import {ICON_SIZE} from 'styles/typographyV2'
import {NavSidebar} from 'types/constEnums'
import {DashTopBar_viewer} from '__generated__/DashTopBar_viewer.graphql'
import parabolLogo from '../styles/theme/images/brand/logo.svg'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'
import TopBarAvatar from './TopBarAvatar'
import TopBarIcon from './TopBarIcon'
import TopBarMeetings from './TopBarMeetings'
import TopBarNotifications from './TopBarNotifications'
import TopBarSearch from './TopBarSearch'

interface Props {
  viewer: DashTopBar_viewer
}

const Wrapper = styled('header')({
  backgroundColor: PALETTE.PRIMARY_MAIN,
  display: 'flex',
  // 64px was the spec, but it looked too fat
  height: 56
})

const LeftNavToggle = styled(PlainButton)({
  fontSize: ICON_SIZE.MD24,
  lineHeight: '16px',
  paddingLeft: 16
})

const LeftNavHeader = styled('div')({
  alignItems: 'center',
  color: PALETTE.TEXT_LIGHT,
  display: 'flex',
  width: NavSidebar.WIDTH
})

const Img = styled('img')({
  padding: 16
})

const TopBarIcons = styled('div')({
  alignItems: 'center',
  color: PALETTE.TEXT_LIGHT,
  display: 'flex',
  flex: 1,
  justifyContent: 'flex-end',
  maxWidth: 560,
  paddingRight: 16
})

const DashTopBar = (props: Props) => {
  const {viewer} = props
  const hasNotification = viewer?.notifications?.edges?.length > 0
  const teams = viewer?.teams ?? []

  return (
    <Wrapper>
      <LeftNavHeader>
        <LeftNavToggle>
          <Icon>{'menu'}</Icon>
        </LeftNavToggle>
        <Img crossOrigin='' src={parabolLogo} alt='' />
      </LeftNavHeader>
      <TopBarSearch />
      <TopBarIcons>
        {false && <TopBarIcon icon={'help_outline'} />}
        <TopBarNotifications hasNotification={hasNotification} />
        <TopBarMeetings teams={teams} />
        <TopBarAvatar viewer={viewer || null} />
      </TopBarIcons>
    </Wrapper>
  )
}

export default createFragmentContainer(DashTopBar, {
  viewer: graphql`
    fragment DashTopBar_viewer on User {
      ...TopBarAvatar_viewer
      picture
      notifications(first: 100) @connection(key: "DashboardWrapper_notifications") {
        edges {
          node {
            id
          }
        }
      }
      teams {
        ...TopBarMeetings_teams
      }
    }
  `
})
