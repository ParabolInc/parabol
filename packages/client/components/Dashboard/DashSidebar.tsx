import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {Menu, ChevronLeft} from '@mui/icons-material'
import {ICON_SIZE} from '~/styles/typographyV2'
import parabolLogo from '../../styles/theme/images/brand/lockup_color_mark_dark_type.svg'
import parabolMark from '../../styles/theme/images/brand/mark-color.svg'
import PlainButton from '../PlainButton/PlainButton'
import useRouter from '~/hooks/useRouter'
import {useLocation, useRouteMatch} from 'react-router'
import {PALETTE} from '../../styles/paletteV3'
import {NavSidebar, AppBar} from '../../types/constEnums'
import {
  AUTHENTICATION_PAGE,
  BILLING_PAGE,
  MEMBERS_PAGE,
  ORG_SETTINGS_PAGE,
  TEAMS_PAGE
} from '../../utils/constants'
import {DashSidebar_viewer$key} from '../../__generated__/DashSidebar_viewer.graphql'
import DashNavList from '../DashNavList/DashNavList'
import SideBarStartMeetingButton from '../SideBarStartMeetingButton'
import LeftDashNavItem from './LeftDashNavItem'
import getTeamIdFromPathname from '../../utils/getTeamIdFromPathname'

const Nav = styled('nav')<{isOpen: boolean}>(({isOpen}) => ({
  // 78px is total height of 'Add meeting' block
  background: 'white',
  height: 'calc(100% - 78px)',
  userSelect: 'none',
  transition: `all 300ms`,
  transform: isOpen ? undefined : `translateX(-${NavSidebar.WIDTH}px)`,
  width: isOpen ? NavSidebar.WIDTH : '70px'
}))

const Contents = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  padding: 0,
  width: NavSidebar.WIDTH
})

const NavMain = styled('div')({
  overflowY: 'auto'
})

const DashHR = styled('div')({
  borderBottom: `solid ${PALETTE.SLATE_300} 1px`,
  width: '100%'
})

const LeftNavToggle = styled(PlainButton)({
  borderRadius: 4,
  fontSize: ICON_SIZE.MD24,
  lineHeight: '16px',
  margin: 12,
  padding: 4,
  ':focus': {
    boxShadow: `0 0 0 2px ${PALETTE.SKY_400}`
  }
})

const LeftNavHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  height: AppBar.HEIGHT,
  justifyContent: 'space-between',
  width: '100%'
})

const LogoWrapper = styled('button')({
  background: 'transparent',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  margin: '8px 0 8px 8px',
  padding: '8px 8px 4px 8px',
  ':focus': {
    boxShadow: `0 0 0 2px ${PALETTE.SKY_400}`,
    outline: 'none'
  }
})

const NavItem = styled(LeftDashNavItem)({
  paddingLeft: 16
})

const NavList = styled(DashNavList)({
  paddingLeft: 16
})

const NavItemsWrap = styled('div')({
  paddingRight: 8
})

const Wrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column'
})

const OrgName = styled('div')({
  paddingTop: 8,
  fontWeight: 600,
  fontSize: 12,
  lineHeight: '24px',
  color: PALETTE.SLATE_500,
  paddingLeft: 16
})

interface Props {
  toggle: () => void
  isOpen: boolean
  viewerRef: DashSidebar_viewer$key | null
}

const DashSidebar = (props: Props) => {
  const {toggle, isOpen, viewerRef} = props
  const match = useRouteMatch<{orgId: string}>('/me/organizations/:orgId')
  const {history} = useRouter()
  const gotoHome = () => {
    history.push('/meetings')
  }

  const viewer = useFragment(
    graphql`
      fragment DashSidebar_viewer on User {
        ...StandardHub_viewer
        featureFlags {
          checkoutFlow
          retrosInDisguise
        }
        organizations {
          ...DashNavList_organization
          id
          name
          isBillingLeader
        }
      }
    `,
    viewerRef
  )

  const location = useLocation()

  if (!viewer) return null
  const {featureFlags, organizations} = viewer
  const showOrgSidebar = featureFlags.checkoutFlow && match

  if (showOrgSidebar) {
    const {orgId: orgIdFromParams} = match.params
    const currentOrg = organizations.find((org) => org.id === orgIdFromParams)
    const {id: orgId, name, isBillingLeader} = currentOrg ?? {}
    return (
      <Wrapper>
        <LeftNavHeader className={`${isOpen ? 'justify-between' : 'justify-center'}`}>
          <LogoWrapper
            className={`${
              isOpen ? 'opacity-1 relative ml-0' : 'absolute -ml-[300px] opacity-0'
            } transition-all duration-300`}
            onClick={gotoHome}
          >
            {isOpen ? (
              <img crossOrigin='' src={parabolLogo} alt='Parabol logo' />
            ) : (
              <img crossOrigin='' src={parabolMark} alt='Parabol logo' />
            )}
          </LogoWrapper>
          <LeftNavToggle onClick={toggle} aria-label='Close dashboard menu'>
            {isOpen ? <ChevronLeft className='hover:opacity-1 opacity-40' /> : <Menu />}
          </LeftNavToggle>
        </LeftNavHeader>
        <SideBarStartMeetingButton isOpen={isOpen} hasRid={featureFlags.retrosInDisguise} />
        <Nav isOpen={isOpen}>
          <Contents>
            <NavItemsWrap>
              <NavItem icon={'arrowBack'} href={'/me/organizations'} label={'Organizations'} />
              <OrgName>{name}</OrgName>
              <NavItem
                icon={'creditScore'}
                href={`/me/organizations/${orgId}/${BILLING_PAGE}`}
                label={'Plans & Billing'}
              />
              {isBillingLeader && (
                <NavItem
                  icon={'groups'}
                  href={`/me/organizations/${orgId}/${TEAMS_PAGE}`}
                  label={'Teams'}
                />
              )}
              <NavItem
                icon={'group'}
                href={`/me/organizations/${orgId}/${MEMBERS_PAGE}`}
                label={'Members'}
              />
              <NavItem
                icon={'work'}
                href={`/me/organizations/${orgId}/${ORG_SETTINGS_PAGE}`}
                label={'Organization Settings'}
              />
              <NavItem
                icon={'key'}
                href={`/me/organizations/${orgId}/${AUTHENTICATION_PAGE}`}
                label={'Authentication'}
              />
            </NavItemsWrap>
          </Contents>
        </Nav>
      </Wrapper>
    )
  }

  const teamId = getTeamIdFromPathname()

  return (
    <Wrapper className={`${isOpen ? ' bg-white' : 'bg-transparent'} transition-all duration-300`}>
      <LeftNavHeader className='justify-between'>
        {!isOpen && (
          <LeftNavToggle onClick={toggle} aria-label='Close dashboard menu'>
            <Menu />
          </LeftNavToggle>
        )}
        <LogoWrapper onClick={gotoHome}>
          {isOpen ? (
            <img crossOrigin='' src={parabolLogo} alt='Parabol logo' />
          ) : (
            <img crossOrigin='' src={parabolMark} alt='Parabol logo' />
          )}
        </LogoWrapper>
        {isOpen && (
          <LeftNavToggle onClick={toggle} aria-label='Close dashboard menu'>
            <ChevronLeft className='text-slate-500 transition-all hover:text-slate-800' />
          </LeftNavToggle>
        )}
      </LeftNavHeader>
      <SideBarStartMeetingButton isOpen={isOpen} hasRid={featureFlags.retrosInDisguise} />
      <Nav isOpen={isOpen}>
        <Contents>
          <NavItemsWrap>
            <NavItem icon={'forum'} href={'/meetings'} label={'Meetings'} />
            <NavItem icon={'timeline'} href={'/me'} label={'History'} />
            <NavItem icon={'playlist_add_check'} href={'/me/tasks'} label={'Tasks'} />
          </NavItemsWrap>
          <DashHR />
          <NavMain>
            <NavList organizationsRef={organizations} />
          </NavMain>
          <DashHR />
          <NavItemsWrap>
            <NavItem icon={'add'} href={'/newteam/1'} label={'Add a Team'} />
          </NavItemsWrap>
          <DashHR />
          <NavItemsWrap>
            {featureFlags.retrosInDisguise && (
              <NavItem
                icon={'magic'}
                href={`/new-meeting/${teamId}`}
                navState={{backgroundLocation: location}}
                label={'Add meeting (legacy)'}
              />
            )}
          </NavItemsWrap>
        </Contents>
      </Nav>
    </Wrapper>
  )
}

export default DashSidebar
