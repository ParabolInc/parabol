import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from '../../styles/paletteV3'
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
  transform: isOpen ? undefined : `translateX(-${NavSidebar.WIDTH}px)`,
  width: isOpen ? NavSidebar.WIDTH : 0
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

const NavItemsWrap = styled('div')({
  paddingRight: 8
})

const DashSidebar = (props: Props) => {
  const {isOpen, viewer} = props
  return (
    <Nav isOpen={isOpen}>
      <Contents>
        <NavItemsWrap>
          <LeftDashNavItem icon={'forum'} href={'/meetings'} label={'Meetings'} />
          <LeftDashNavItem icon={'timeline'} href={'/me'} label={'Timeline'} />
          <LeftDashNavItem icon={'playlist_add_check'} href={'/me/tasks'} label={'Tasks'} />
        </NavItemsWrap>
        <DashHR />
        <NavMain>
          <DashNavList viewer={viewer} />
        </NavMain>
        <DashHR />
        <NavItemsWrap>
          <LeftDashNavItem icon={'add'} href={'/newteam/1'} label={'Add a Team'} />
        </NavItemsWrap>
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
