import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {useRouteMatch} from 'react-router'
import {DashSidebar_viewer$key} from '../../__generated__/DashSidebar_viewer.graphql'
import {PALETTE} from '../../styles/paletteV3'
import {NavSidebar} from '../../types/constEnums'
import {
  AUTHENTICATION_PAGE,
  BILLING_PAGE,
  MEMBERS_PAGE,
  ORG_SETTINGS_PAGE,
  TEAMS_PAGE
} from '../../utils/constants'
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
  color: PALETTE.SLATE_500
})

const NavMain = styled('div')({
  overflowY: 'auto'
})

const NavItemsWrap = styled('div')({
  paddingRight: 8
})

const NavItem = styled(LeftDashNavItem)({
  borderRadius: 44,
  paddingLeft: 15
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
  justifyContent: 'flex-end'
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
        {/* <StandardHub handleMenuClick={handleMenuClick} viewer={viewer} /> */}
        <NavBlock>
          <Nav>
            <NavItemsWrap>
              <LeftDashNavItem
                onClick={handleMenuClick}
                icon={'arrowBack'}
                href={'/me/organizations'}
                label={'Organizations'}
                exact
              />
              <OrgName>{name}</OrgName>
              <LeftDashNavItem
                onClick={handleMenuClick}
                icon={'creditScore'}
                href={`/me/organizations/${orgId}/${BILLING_PAGE}`}
                label={'Plans & Billing'}
              />
              <LeftDashNavItem
                onClick={handleMenuClick}
                icon={'groups'}
                href={`/me/organizations/${orgId}/${TEAMS_PAGE}`}
                label={'Teams'}
              />
              <LeftDashNavItem
                onClick={handleMenuClick}
                icon={'group'}
                href={`/me/organizations/${orgId}/${MEMBERS_PAGE}`}
                label={'Members'}
              />
              <LeftDashNavItem
                onClick={handleMenuClick}
                icon={'work'}
                href={`/me/organizations/${orgId}/${ORG_SETTINGS_PAGE}`}
                label={'Organization Settings'}
              />
              <LeftDashNavItem
                onClick={handleMenuClick}
                icon={'key'}
                href={`/me/organizations/${orgId}/${AUTHENTICATION_PAGE}`}
                label={'Authentication'}
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
            <div className='p-3'>
              <NavItem icon={'userSettings'} href={'/me/profile'} label={'My Settings'} />
              <NavItem icon={'forum'} href={'/me/organizations'} label={'Organizations'} />
              <NavItem icon={'timeline'} href={'/signout'} label={'Sign Out'} exact />
            </div>
          </NavItemsWrap>
          <DashHR />
          <NavItemsWrap>
            <div className='p-3'>
              <NavItem icon={'forum'} href={'/meetings'} label={'Meetings'} />
              <NavItem icon={'timeline'} href={'/me'} label={'History'} exact />
              <NavItem icon={'playlist_add_check'} href={'/me/tasks'} label={'Tasks'} />
              <NavItem icon={'add'} href={'/newteam/1'} label={'Add a Team'} />
            </div>
          </NavItemsWrap>
          <NavMain>
            <DashNavList onClick={handleMenuClick} organizationsRef={organizations} />
          </NavMain>
          <Footer>
            <FooterBottom>
              <LeftDashParabol />
            </FooterBottom>
          </Footer>
        </Nav>
      </NavBlock>
    </DashSidebarStyles>
  )
}

export default MobileDashSidebar
