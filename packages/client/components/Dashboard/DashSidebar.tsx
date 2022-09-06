import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from '../../styles/paletteV3'
import {NavSidebar} from '../../types/constEnums'
import {DashSidebar_viewer} from '../../__generated__/DashSidebar_viewer.graphql'
import DashNavList from '../DashNavList/DashNavList'
import SideBarStartMeetingButton from '../SideBarStartMeetingButton'
import LeftDashNavItem from './LeftDashNavItem'

interface Props {
  isOpen: boolean
  viewer: DashSidebar_viewer | null
}

const Nav = styled('nav')<{isOpen: boolean}>(({isOpen}) => ({
  height: '100%',
  userSelect: 'none',
  transition: `all 300ms`,
  transform: isOpen ? undefined : `translateX(-${NavSidebar.WIDTH}px)`,
  width: isOpen ? NavSidebar.WIDTH : '70px'
}))

const Contents = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
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

const DashSidebar = (props: Props) => {
  const {isOpen, viewer} = props

  const {t} = useTranslation()

  return (
    <Wrapper>
      <SideBarStartMeetingButton isOpen={isOpen} />
      <Nav isOpen={isOpen}>
        <Contents>
          <NavItemsWrap>
            <NavItem
              icon={t('DashSidebar.Forum')}
              href={t('DashSidebar.Meetings')}
              label={t('DashSidebar.Meetings')}
            />
            <NavItem
              icon={t('DashSidebar.Timeline')}
              href={t('DashSidebar.Me')}
              label={t('DashSidebar.Timeline')}
            />
            <NavItem
              icon={t('DashSidebar.PlaylistAddCheck')}
              href={t('DashSidebar.MeTasks')}
              label={t('DashSidebar.Tasks')}
            />
          </NavItemsWrap>
          <DashHR />
          <NavMain>
            <NavList viewer={viewer} />
          </NavMain>
          <DashHR />
          <NavItemsWrap>
            <NavItem
              icon={t('DashSidebar.Add')}
              href={t('DashSidebar.Newteam1')}
              label={t('DashSidebar.AddATeam')}
            />
          </NavItemsWrap>
        </Contents>
      </Nav>
    </Wrapper>
  )
}

export default createFragmentContainer(DashSidebar, {
  viewer: graphql`
    fragment DashSidebar_viewer on User {
      ...StandardHub_viewer
      ...DashNavList_viewer
    }
  `
})
