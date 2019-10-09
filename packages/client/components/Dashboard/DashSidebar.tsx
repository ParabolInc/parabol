import {DashSidebar_viewer} from '../../__generated__/DashSidebar_viewer.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {NavLink} from 'react-router-dom'
import DashNavList from '../DashNavList/DashNavList'
import Icon from '../Icon'
import LogoBlock from '../LogoBlock/LogoBlock'
import StandardHub from '../StandardHub/StandardHub'
import makeHoverFocus from '../../styles/helpers/makeHoverFocus'
import {ICON_SIZE} from '../../styles/typographyV2'
import {PALETTE} from '../../styles/paletteV2'
import {NavSidebar} from '../../types/constEnums'
import DashNavItem from './DashNavItem'
import {ClassNames} from '@emotion/core'

interface Props {
  handleMenuClick: () => void
  viewer: DashSidebar_viewer | null
}

const linkBaseStyles = {
  color: '#FFFFFF',
  textDecoration: 'none'
}

const DashSidebarStyles = styled('div')({
  backgroundColor: PALETTE.BACKGROUND_PRIMARY,
  color: '#FFFFFF',
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  maxWidth: NavSidebar.WIDTH,
  minWidth: NavSidebar.WIDTH,
  overflow: 'hidden',
  userSelect: 'none'
})

const MyDashboard = styled('div')({
  borderBottom: `1px solid ${PALETTE.BORDER_NAV_DARK}`,
  marginBottom: 16
})

const NavBlock = styled('div')({
  flex: 1,
  position: 'relative'
})

const Nav = styled('nav')({
  display: 'flex',
  flexDirection: 'column',
  left: 0,
  maxHeight: '100%',
  paddingBottom: '1.25rem',
  position: 'absolute',
  top: 0,
  width: '100%'
})

const NavMain = styled('div')({
  flex: 1,
  overflowY: 'auto'
})

const NavLabel = styled('div')({
  color: 'rgba(255, 255, 255, .5)',
  cursor: 'default',
  fontSize: 12,
  fontWeight: 600,
  marginLeft: '2.1875rem',
  padding: '1.25rem 0',
  textTransform: 'uppercase'
})

const addTeamStyles = {
  ...linkBaseStyles,
  alignItems: 'center',
  borderLeft: `${NavSidebar.LEFT_BORDER_WIDTH} solid transparent`,
  cursor: 'pointer',
  display: 'flex',
  margin: '.75rem 0 0',
  opacity: '.65',
  padding: '.625rem .5rem .625rem 2rem',
  position: 'relative',
  transition: `opacity 100ms ease-in`,
  userSelect: 'none',

  ...makeHoverFocus({
    ...linkBaseStyles,
    backgroundColor: PALETTE.BACKGROUND_NAV_DARK_HOVER,
    opacity: 1
  })
}

const disabledAddTeamStyles = {
  backgroundColor: PALETTE.BACKGROUND_NAV_DARK_ACTIVE,
  cursor: 'default',
  opacity: 1,

  ...makeHoverFocus({
    backgroundColor: PALETTE.BACKGROUND_NAV_DARK_ACTIVE,
    opacity: 1
  })
}

const AddTeamIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18,
  marginRight: '.5rem'
})

const AddTeamLabel = styled('div')({
  fontSize: NavSidebar.FONT_SIZE,
  lineHeight: NavSidebar.LINE_HEIGHT
})

const DashSidebar = (props: Props) => {
  const {handleMenuClick, viewer} = props
  return (
    <DashSidebarStyles>
      <StandardHub handleMenuClick={handleMenuClick} viewer={viewer} />
      <NavBlock>
        <Nav>
          {/* use div for flex layout */}
          <div>
            <MyDashboard>
              <DashNavItem
                href='/me'
                icon='dashboard'
                label='My Dashboard'
                onClick={handleMenuClick}
              />
            </MyDashboard>
            <NavLabel>{'My Teams'}</NavLabel>
          </div>
          <NavMain>
            <DashNavList viewer={viewer} onClick={handleMenuClick} />
          </NavMain>
          <ClassNames>
            {({css}) => {
              return (
                <NavLink
                  onClick={handleMenuClick}
                  className={css(addTeamStyles)}
                  activeClassName={css(disabledAddTeamStyles)}
                  title='Add New Team'
                  to='/newteam/1'
                >
                  <AddTeamIcon>add_circle</AddTeamIcon>
                  <AddTeamLabel>{'Add New Team'}</AddTeamLabel>
                </NavLink>
              )
            }}
          </ClassNames>
        </Nav>
      </NavBlock>
      <LogoBlock variant='white' onClick={handleMenuClick} />
    </DashSidebarStyles>
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
