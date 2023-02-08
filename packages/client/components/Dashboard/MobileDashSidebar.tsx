import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {useLocation} from 'react-router'
import {PALETTE} from '../../styles/paletteV3'
import {Breakpoint, NavSidebar} from '../../types/constEnums'
import makeMinWidthMediaQuery from '../../utils/makeMinWidthMediaQuery'
import {DashSidebar_viewer$key} from '../../__generated__/DashSidebar_viewer.graphql'
import DashNavList from '../DashNavList/DashNavList'
import StandardHub from '../StandardHub/StandardHub'
import LeftDashNavItem from './LeftDashNavItem'
import LeftDashParabol from './LeftDashNavParabol'

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
  userSelect: 'none'
})

const NavBlock = styled('div')({
  flex: 1,
  position: 'relative',
  padding: 8
})

const Nav = styled('nav')({
  display: 'flex',
  flexDirection: 'column',
  left: 0,
  height: '100%',
  maxHeight: '100%',
  padding: '0 0 8px 8px',
  position: 'absolute',
  top: 0,
  width: '100%'
})

const OrgName = styled('div')({
  paddingTop: 8,
  paddingLeft: 8,
  fontWeight: 600,
  fontSize: 12,
  lineHeight: '24px',
  color: PALETTE.SLATE_500,
  [makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)]: {
    paddingLeft: 16
  }
})

const NavMain = styled('div')({
  overflowY: 'auto'
})

const NavItemsWrap = styled('div')({
  paddingRight: 8
})

const DashHR = styled('div')({
  borderBottom: `solid ${PALETTE.SLATE_300} 1px`,
  marginLeft: -8,
  width: 'calc(100% + 8px)'
})

const Footer = styled('div')({
  display: 'flex',
  // safari flexbox bug: https://stackoverflow.com/a/58720054/3155110
  flex: '1 0 auto',
  flexDirection: 'column',
  justifyContent: 'space-between'
})

const FooterBottom = styled('div')({})

const MobileDashSidebar = (props: Props) => {
  const {handleMenuClick, viewerRef} = props

  const viewer = useFragment(
    graphql`
      fragment MobileDashSidebar_viewer on User {
        ...StandardHub_viewer
        ...DashNavList_viewer
        featureFlags {
          checkoutFlow
        }
        organizations {
          id
          name
        }
      }
    `,
    viewerRef
  )
  const location = useLocation()
  const {pathname} = location
  if (!viewer) return null
  const {featureFlags, organizations} = viewer
  const showOrgSidebar = featureFlags.checkoutFlow && pathname.startsWith(`/me/organizations`)

  if (showOrgSidebar) {
    const orgIdFromPathname = pathname.split('/')[3]
    const currentOrg = organizations.find((org) => org.id === orgIdFromPathname)
    const {id: orgId, name} = currentOrg ?? {}
    return (
      <DashSidebarStyles>
        <StandardHub handleMenuClick={handleMenuClick} viewer={viewer} />
        <NavBlock>
          <Nav>
            <NavItemsWrap>
              <LeftDashNavItem
                onClick={handleMenuClick}
                icon={'arrowBack'}
                href={'/me'}
                label={'Back'}
              />
              <OrgName>{name}</OrgName>
              <LeftDashNavItem
                onClick={handleMenuClick}
                icon={'group'}
                href={`/me/organizations/${orgId}/member`}
                label={'Members'}
              />
              <LeftDashNavItem
                onClick={handleMenuClick}
                icon={'creditScore'}
                href={`/me/organizations/${orgId}/billing`}
                label={'Plans & Billing'}
              />
            </NavItemsWrap>
          </Nav>
        </NavBlock>
      </DashSidebarStyles>
    )
  }

  return (
    <DashSidebarStyles>
      <StandardHub handleMenuClick={handleMenuClick} viewer={viewer} />
      <NavBlock>
        <Nav>
          <NavItemsWrap>
            <LeftDashNavItem
              onClick={handleMenuClick}
              icon={'forum'}
              href={'/meetings'}
              label={'Meetings'}
            />
            <LeftDashNavItem
              onClick={handleMenuClick}
              icon={'history'}
              href={'/me'}
              label={'History'}
            />
            <LeftDashNavItem
              onClick={handleMenuClick}
              icon={'playlist_add_check'}
              href={'/me/tasks'}
              label={'Tasks'}
            />
          </NavItemsWrap>
          <DashHR />
          <NavMain>
            <DashNavList onClick={handleMenuClick} viewer={viewer} />
          </NavMain>
          <DashHR />
          <Footer>
            <NavItemsWrap>
              <LeftDashNavItem
                onClick={handleMenuClick}
                icon={'add'}
                href={'/newteam/1'}
                label={'Add a Team'}
              />
            </NavItemsWrap>
            <FooterBottom>
              <NavItemsWrap>
                <LeftDashNavItem
                  onClick={handleMenuClick}
                  icon={'exit_to_app'}
                  href={'/signout'}
                  label={'Sign out'}
                />
              </NavItemsWrap>
              <LeftDashParabol />
            </FooterBottom>
          </Footer>
        </Nav>
      </NavBlock>
    </DashSidebarStyles>
  )
}

export default MobileDashSidebar
