import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {MenuPosition} from 'hooks/useCoords'
import useMenu from 'hooks/useMenu'
import useRouter from 'hooks/useRouter'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from 'styles/paletteV2'
import {ICON_SIZE} from 'styles/typographyV2'
import {NavSidebar} from 'types/constEnums'
import lazyPreload from 'utils/lazyPreload'
import {DashTopBar_viewer} from '__generated__/DashTopBar_viewer.graphql'
import defaultUserAvatar from '../styles/theme/images/avatar-user.svg'
import parabolLogo from '../styles/theme/images/brand/logo.svg'
import Avatar from './Avatar/Avatar'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'
import TopBarIcon from './TopBarIcon'
import TopBarSearch from './TopBarSearch'

interface Props {
  viewer: any
}

const getActiveMeetings = (teams: DashTopBar_viewer['teams']) => {
  const allActiveMeetings: {link: string; name: string}[] = []
  teams.forEach((team) => {
    const {activeMeetings, name: teamName} = team
    activeMeetings.forEach((activeMeeting) => {
      const {id: meetingId, name: meetingName} = activeMeeting
      allActiveMeetings.push({
        link: `/meet/${meetingId}`,
        name: `${teamName} ${meetingName}`
      })
    })
  })
  return allActiveMeetings
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

const SpacedAvatar = styled(Avatar)({
  marginLeft: 8
})

const StandardHubUserMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'StandardHubUserMenu' */ './StandardHubUserMenu')
)

const DashTopBar = (props: Props) => {
  const {viewer} = props
  const userAvatar = viewer?.picture ?? defaultUserAvatar
  const hasNotification = viewer?.notifications?.edges?.length > 0
  const teams = viewer?.teams ?? []
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_RIGHT
  )
  const {history} = useRouter()
  const gotoNotifications = () => {
    history.push('/me/notifications')
  }
  const activeMeetings = useMemo(() => getActiveMeetings(teams), [teams])
  const hasMeetings = activeMeetings.length > 0
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
        <TopBarIcon onClick={gotoNotifications} icon={'notifications'} hasBadge={hasNotification} />
        <TopBarIcon icon={'forum'} hasBadge={!!activeMeetings.length} />
        <SpacedAvatar
          onClick={togglePortal}
          onMouseEnter={StandardHubUserMenu.preload}
          ref={originRef}
          hasBadge={false}
          picture={userAvatar}
          size={40}
        />
        {menuPortal(<StandardHubUserMenu menuProps={menuProps} viewer={viewer!} />)}
      </TopBarIcons>
    </Wrapper>
  )
}

graphql`
  fragment DashTopBarActiveMeetings on Team {
    activeMeetings {
      id
      meetingType
      name
    }
    name
  }
`

export default createFragmentContainer(DashTopBar, {
  viewer: graphql`
    fragment DashTopBar_viewer on User {
      ...StandardHubUserMenu_viewer
      picture
      notifications(first: 100) @connection(key: "DashboardWrapper_notifications") {
        edges {
          node {
            id
          }
        }
      }
      teams {
        ...DashTopBarActiveMeetings @relay(mask: false)
      }
    }
  `
})
