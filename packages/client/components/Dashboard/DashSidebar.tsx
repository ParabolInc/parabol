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
  height: '100vh',
  userSelect: 'none',
  transition: `all 300ms`,
  transform: isOpen ? undefined : 'translateX(-240px)',
  width: isOpen ? NavSidebar.WIDTH : 0
}))

const Contents = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: NavSidebar.WIDTH
})

const NavMain = styled('div')({
  flex: 1,
  overflowY: 'auto'
})

const DashHR = styled('div')({
  borderBottom: `solid ${PALETTE.BACKGROUND_TOGGLE_ACTIVE} 1px`,
  marginLeft: -8,
  marginTop: 4,
  marginBottom: 4,
  width: 'calc(100% + 16px)'
})

const Footer = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'space-between'
})

const FooterBottom = styled('div')({})

const DashSidebar = (props: Props) => {
  const {isOpen, viewer} = props
  console.log('isOpen', isOpen)
  return (
    <Nav isOpen={isOpen}>
      <Contents>
        <LeftDashNavItem icon={'timeline'} href={'/me'} label={'Timeline'} />
        <LeftDashNavItem icon={'playlist_add_check'} href={'/me/tasks'} label={'Tasks'} />
        <DashHR />
        <NavMain>
          <DashNavList viewer={viewer} />
        </NavMain>
        <DashHR />
        <Footer>
          <LeftDashNavItem icon={'add'} href={'/newteam/1'} label={'Add a Team'} />
          <FooterBottom>
            <LeftDashNavItem icon={'exit_to_app'} href={'/signout'} label={'Sign out'} />
          </FooterBottom>
        </Footer>
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
