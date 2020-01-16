import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from '../../styles/paletteV2'
import {NavSidebar} from '../../types/constEnums'
import {DashSidebar_viewer} from '../../__generated__/DashSidebar_viewer.graphql'
import DashNavList from '../DashNavList/DashNavList'
import LeftDashNavItem from './LeftDashNavItem'

interface Props {
  isOpen: boolean
  viewer: DashSidebar_viewer | null
}

const Nav = styled('nav')<{isOpen: boolean}>(({isOpen}) => ({
  height: '100%',
  userSelect: 'none',
  transition: `all 300ms`,
  transform: isOpen ? undefined : 'translateX(-240px)',
  width: isOpen ? NavSidebar.WIDTH : 0
}))

const Contents = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: NavSidebar.WIDTH
})

const NavMain = styled('div')({
  // flex: 1,
  overflowY: 'auto'
})

const DashHR = styled('div')({
  borderBottom: `solid ${PALETTE.BACKGROUND_TOGGLE_ACTIVE} 1px`,
  marginLeft: -8,
  marginTop: 4,
  marginBottom: 4,
  width: 'calc(100% + 16px)'
})

const NavItem = styled(LeftDashNavItem)({
  paddingLeft: 16
})

const NavList = styled(DashNavList)({
  paddingLeft: 16
})

const DashSidebar = (props: Props) => {
  const {isOpen, viewer} = props
  console.log('isOpen', isOpen)
  return (
    <Nav isOpen={isOpen}>
      <Contents>
        <NavItem icon={'timeline'} href={'/me'} label={'Timeline'} />
        <NavItem icon={'playlist_add_check'} href={'/me/tasks'} label={'Tasks'} />
        <DashHR />
        <NavMain>
          <NavList viewer={viewer} />
        </NavMain>
        <DashHR />
        <NavItem icon={'add'} href={'/newteam/1'} label={'Add a Team'} />
      </Contents>
    </Nav>
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
