import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useRouteMatch} from 'react-router'
import {DashSidebar_viewer$key} from '../../__generated__/DashSidebar_viewer.graphql'
import {PALETTE} from '../../styles/paletteV3'
import {GlobalBanner, NavSidebar} from '../../types/constEnums'
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

const DashSidebarStyles = styled('div')({
  backgroundColor: '#fff',
  color: PALETTE.SLATE_600,
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  maxWidth: NavSidebar.WIDTH,
  minWidth: NavSidebar.WIDTH,
  overflow: 'hidden',
  paddingTop: isGlobalBannerEnabled ? GlobalBanner.HEIGHT : 0,
  userSelect: 'none'
})

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

const NavItem = styled(LeftDashNavItem)({
  borderRadius: 44,
  paddingLeft: 16
})

const DashHR = styled('div')({
  borderBottom: `solid ${PALETTE.SLATE_400} 1px`,
  marginLeft: -8,
  width: 'calc(100% + 8px)'
})

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
  const match = useRouteMatch<{orgId: string}>('/me/organizations/:orgId')

  const viewer = useFragment(
    graphql`
      fragment MobileDashSidebar_viewer on User {
        ...StandardHub_viewer
        organizations {
          ...DashNavList_organization
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
    const {orgId: orgIdFromParams} = match.params
    const currentOrg = organizations.find((org) => org.id === orgIdFromParams)
    const {id: orgId, name} = currentOrg ?? {}
    return (
      <DashSidebarStyles>
        <StandardHub handleMenuClick={handleMenuClick} viewer={viewer} />
        <NavBlock>
          <Nav>
            <TopNavItemsWrap>
              <NavItem
                onClick={handleMenuClick}
                icon={'userSettings'}
                href={'/me/profile'}
                label={'My Settings'}
              />
              <NavItem
                onClick={handleMenuClick}
                icon={'exit_to_app'}
                href={'/signout'}
                label={'Sign Out'}
                exact
              />
            </TopNavItemsWrap>
            <DashHR />
            <NavItemsWrap>
              <NavItem
                onClick={handleMenuClick}
                icon={'arrowBack'}
                href={'/me/organizations'}
                label={'Organizations'}
                exact
              />
              <div className='mt-4 mb-1 flex min-h-[32px] items-center'>
                <span className='flex-1 pl-3 text-base leading-6 font-semibold text-slate-700'>
                  {name}
                </span>
              </div>
              <NavItem
                onClick={handleMenuClick}
                icon={'creditScore'}
                href={`/me/organizations/${orgId}/${BILLING_PAGE}`}
                label={'Plans & Billing'}
              />
              <NavItem
                onClick={handleMenuClick}
                icon={'groups'}
                href={`/me/organizations/${orgId}/${TEAMS_PAGE}`}
                label={'Teams'}
              />
              <NavItem
                onClick={handleMenuClick}
                icon={'group'}
                href={`/me/organizations/${orgId}/${MEMBERS_PAGE}`}
                label={'Members'}
              />
              <NavItem
                onClick={handleMenuClick}
                icon={'work'}
                href={`/me/organizations/${orgId}/${ORG_SETTINGS_PAGE}`}
                label={'Organization Settings'}
              />
              <NavItem
                onClick={handleMenuClick}
                icon={'appRegistration'}
                href={`/me/organizations/${orgId}/${ORG_INTEGRATIONS_PAGE}`}
                label={'Integration Settings'}
              />
              <NavItem
                onClick={handleMenuClick}
                icon={'key'}
                href={`/me/organizations/${orgId}/${AUTHENTICATION_PAGE}`}
                label={'Authentication'}
              />
            </NavItemsWrap>
          </Nav>
        </NavBlock>
        <DashHR />
        <Footer>
          <FooterBottom>
            <LeftDashParabol />
          </FooterBottom>
        </Footer>
      </DashSidebarStyles>
    )
  }

  return (
    <DashSidebarStyles>
      <StandardHub handleMenuClick={handleMenuClick} viewer={viewer} />
      <NavBlock>
        <Nav>
          <TopNavItemsWrap>
            <NavItem
              onClick={handleMenuClick}
              icon={'userSettings'}
              href={'/me/profile'}
              label={'My Settings'}
            />
            <NavItem
              onClick={handleMenuClick}
              icon={'exit_to_app'}
              href={'/signout'}
              label={'Sign Out'}
              exact
            />
          </TopNavItemsWrap>
          <DashHR />
          <NavItemsWrap>
            <NavItem
              onClick={handleMenuClick}
              icon={'forum'}
              href={'/meetings'}
              label={'Meetings'}
            />
            <NavItem
              onClick={handleMenuClick}
              icon={'timeline'}
              href={'/me'}
              label={'History'}
              exact
            />
            <NavItem
              onClick={handleMenuClick}
              icon={'playlist_add_check'}
              href={'/me/tasks'}
              label={'Tasks'}
            />
            <NavItem
              onClick={handleMenuClick}
              icon={'add'}
              href={'/newteam/1'}
              label={'Add a Team'}
            />
          </NavItemsWrap>
          <DashNavList onClick={handleMenuClick} organizationsRef={organizations} />
        </Nav>
      </NavBlock>
      <DashHR />
      <Footer>
        <FooterBottom>
          <LeftDashParabol />
        </FooterBottom>
      </Footer>
    </DashSidebarStyles>
  )
}

export default MobileDashSidebar
