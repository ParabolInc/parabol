import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from '../../styles/paletteV3'
import {NavSidebar} from '../../types/constEnums'
import {DashSidebar_viewer} from '../../__generated__/DashSidebar_viewer.graphql'
import DashNavList from '../DashNavList/DashNavList'
import StandardHub from '../StandardHub/StandardHub'
import LeftDashNavItem from './LeftDashNavItem'
import LeftDashParabol from './LeftDashNavParabol'

interface Props {
  handleMenuClick: () => void
  viewer: DashSidebar_viewer | null
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
  const {handleMenuClick, viewer} = props

  const {t} = useTranslation()

  return (
    <DashSidebarStyles>
      <StandardHub handleMenuClick={handleMenuClick} viewer={viewer} />
      <NavBlock>
        <Nav>
          <NavItemsWrap>
            <LeftDashNavItem
              onClick={handleMenuClick}
              icon={t('MobileDashSidebar.Forum')}
              href={t('MobileDashSidebar.Meetings')}
              label={t('MobileDashSidebar.Meetings')}
            />
            <LeftDashNavItem
              onClick={handleMenuClick}
              icon={t('MobileDashSidebar.Timeline')}
              href={t('MobileDashSidebar.Me')}
              label={t('MobileDashSidebar.Timeline')}
            />
            <LeftDashNavItem
              onClick={handleMenuClick}
              icon={t('MobileDashSidebar.PlaylistAddCheck')}
              href={t('MobileDashSidebar.MeTasks')}
              label={t('MobileDashSidebar.Tasks')}
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
                icon={t('MobileDashSidebar.Add')}
                href={t('MobileDashSidebar.Newteam1')}
                label={t('MobileDashSidebar.AddATeam')}
              />
            </NavItemsWrap>
            <FooterBottom>
              <NavItemsWrap>
                <LeftDashNavItem
                  onClick={handleMenuClick}
                  icon={t('MobileDashSidebar.ExitToApp')}
                  href={t('MobileDashSidebar.Signout')}
                  label={t('MobileDashSidebar.SignOut')}
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

export default createFragmentContainer(MobileDashSidebar, {
  viewer: graphql`
    fragment MobileDashSidebar_viewer on User {
      ...StandardHub_viewer
      ...DashNavList_viewer
    }
  `
})
