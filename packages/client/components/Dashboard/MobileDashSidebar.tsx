import styled from '@emotion/styled'
import AccountBoxIcon from '@mui/icons-material/AccountBox'
import AddIcon from '@mui/icons-material/Add'
import AppRegistrationIcon from '@mui/icons-material/AppRegistration'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CreditScoreIcon from '@mui/icons-material/CreditScore'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import ForumIcon from '@mui/icons-material/Forum'
import GroupIcon from '@mui/icons-material/Group'
import GroupsIcon from '@mui/icons-material/Groups'
import KeyIcon from '@mui/icons-material/Key'
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck'
import TimelineIcon from '@mui/icons-material/Timeline'
import WorkIcon from '@mui/icons-material/Work'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useMatch} from 'react-router'
import type {DashSidebar_viewer$key} from '../../__generated__/DashSidebar_viewer.graphql'
import {cn} from '../../ui/cn'
import {
  AUTHENTICATION_PAGE,
  BILLING_PAGE,
  MEMBERS_PAGE,
  ORG_INTEGRATIONS_PAGE,
  ORG_SETTINGS_PAGE,
  TEAMS_PAGE
} from '../../utils/constants'
import DashNavList from '../DashNavList/DashNavList'
import StandardHub from '../StandardHub/StandardHub'
import LeftDashNavItem from './LeftDashNavItem'
import LeftDashParabol from './LeftDashNavParabol'

const isGlobalBannerEnabled = window.__ACTION__.GLOBAL_BANNER_ENABLED

interface Props {
  handleMenuClick: () => void
  viewerRef: DashSidebar_viewer$key | null
}

// NavSidebar.WIDTH = 256px (max-w-64/min-w-64); GlobalBanner.HEIGHT = 24px (pt-6)
const dashSidebarClassName = cn(
  'flex h-screen min-w-64 max-w-64 select-none flex-col overflow-hidden bg-surface-sidebar text-fg-nav-muted',
  isGlobalBannerEnabled && 'pt-6'
)

const NavBlock = styled('div')({
  flex: 1,
  position: 'relative',
  padding: 8,
  overflowY: 'auto'
})

const Nav = styled('nav')({
  display: 'flex',
  flexDirection: 'column',
  left: 0,
  height: '100%',
  maxHeight: '100%',
  padding: 0,
  position: 'absolute',
  top: 0,
  width: '100%'
})

const TopNavItemsWrap = styled('div')({
  padding: '10px 12px'
})

const NavItemsWrap = styled('div')({
  padding: '10px 12px 0'
})

const dashHRClassName = '-ml-2 w-[calc(100%+8px)] border-hairline-strong border-b'

const Footer = styled('div')({
  display: 'flex',
  // safari flexbox bug: https://stackoverflow.com/a/58720054/3155110
  flexDirection: 'column',
  justifyContent: 'flex-end',
  marginTop: 'auto',
  padding: 8
})

const FooterBottom = styled('div')({})

const MobileDashSidebar = (props: Props) => {
  const {handleMenuClick, viewerRef} = props
  const match = useMatch('/me/organizations/:orgId/*')

  const viewer = useFragment(
    graphql`
      fragment MobileDashSidebar_viewer on User {
        ...StandardHub_viewer
        ...DashNavList_viewer
        organizations {
          id
          name
        }
      }
    `,
    viewerRef
  )
  if (!viewer) return null
  const {organizations} = viewer

  if (match) {
    const orgIdFromParams = match.params.orgId!
    const currentOrg = organizations.find((org) => org.id === orgIdFromParams)
    const {id: orgId, name} = currentOrg ?? {}
    return (
      <div className={dashSidebarClassName}>
        <StandardHub handleMenuClick={handleMenuClick} viewer={viewer} />
        <NavBlock>
          <Nav>
            <TopNavItemsWrap>
              <LeftDashNavItem
                onClick={handleMenuClick}
                Icon={AccountBoxIcon}
                href={'/me/profile'}
                label={'My Settings'}
              />
              <LeftDashNavItem
                onClick={handleMenuClick}
                Icon={ExitToAppIcon}
                href={'/signout'}
                label={'Sign Out'}
                exact
              />
            </TopNavItemsWrap>
            <div className={dashHRClassName} />
            <NavItemsWrap>
              <LeftDashNavItem
                onClick={handleMenuClick}
                Icon={ArrowBackIcon}
                href={'/me/organizations'}
                label={'Organizations'}
                exact
              />
              <div className='mt-4 mb-1 flex min-h-[32px] items-center'>
                <span className='flex-1 pl-3 font-semibold text-base text-fg-nav leading-6'>
                  {name}
                </span>
              </div>
              <LeftDashNavItem
                onClick={handleMenuClick}
                Icon={CreditScoreIcon}
                href={`/me/organizations/${orgId}/${BILLING_PAGE}`}
                label={'Plans & Billing'}
              />
              <LeftDashNavItem
                onClick={handleMenuClick}
                Icon={GroupsIcon}
                href={`/me/organizations/${orgId}/${TEAMS_PAGE}`}
                label={'Teams'}
              />
              <LeftDashNavItem
                onClick={handleMenuClick}
                Icon={GroupIcon}
                href={`/me/organizations/${orgId}/${MEMBERS_PAGE}`}
                label={'Members'}
              />
              <LeftDashNavItem
                onClick={handleMenuClick}
                Icon={WorkIcon}
                href={`/me/organizations/${orgId}/${ORG_SETTINGS_PAGE}`}
                label={'Organization Settings'}
              />
              <LeftDashNavItem
                onClick={handleMenuClick}
                Icon={AppRegistrationIcon}
                href={`/me/organizations/${orgId}/${ORG_INTEGRATIONS_PAGE}`}
                label={'Integration Settings'}
              />
              <LeftDashNavItem
                onClick={handleMenuClick}
                Icon={KeyIcon}
                href={`/me/organizations/${orgId}/${AUTHENTICATION_PAGE}`}
                label={'Authentication'}
              />
            </NavItemsWrap>
          </Nav>
        </NavBlock>
        <div className={dashHRClassName} />
        <Footer>
          <FooterBottom>
            <LeftDashParabol />
          </FooterBottom>
        </Footer>
      </div>
    )
  }

  return (
    <div className={dashSidebarClassName}>
      <StandardHub handleMenuClick={handleMenuClick} viewer={viewer} />
      <NavBlock>
        <Nav>
          <TopNavItemsWrap>
            <LeftDashNavItem
              onClick={handleMenuClick}
              Icon={AccountBoxIcon}
              href={'/me/profile'}
              label={'My Settings'}
            />
            <LeftDashNavItem
              onClick={handleMenuClick}
              Icon={ExitToAppIcon}
              href={'/signout'}
              label={'Sign Out'}
              exact
            />
          </TopNavItemsWrap>
          <div className={dashHRClassName} />
          <NavItemsWrap>
            <LeftDashNavItem
              onClick={handleMenuClick}
              Icon={ForumIcon}
              href={'/meetings'}
              label={'Meetings'}
            />
            <LeftDashNavItem
              onClick={handleMenuClick}
              Icon={TimelineIcon}
              href={'/me'}
              label={'History'}
              exact
            />
            <LeftDashNavItem
              onClick={handleMenuClick}
              Icon={PlaylistAddCheckIcon}
              href={'/me/tasks'}
              label={'Tasks'}
            />
            <LeftDashNavItem
              onClick={handleMenuClick}
              Icon={AddIcon}
              href={'/newteam'}
              label={'Add a Team'}
            />
          </NavItemsWrap>
          <DashNavList closeMobileSidebar={handleMenuClick} viewerRef={viewer} />
        </Nav>
      </NavBlock>
      <div className={dashHRClassName} />
      <Footer>
        <FooterBottom>
          <LeftDashParabol />
        </FooterBottom>
      </Footer>
    </div>
  )
}

export default MobileDashSidebar
