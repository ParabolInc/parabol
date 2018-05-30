import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {NavLink} from 'react-router-dom'
import tinycolor from 'tinycolor2'
import DashNavList from 'universal/components/DashNavList/DashNavList'
import StandardHub from 'universal/components/StandardHub/StandardHub'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import DashNavItem from './DashNavItem'
import LogoBlock from 'universal/components/LogoBlock/LogoBlock'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import styled, {css} from 'react-emotion'

const color = tinycolor.mix(appTheme.palette.mid10l, '#fff', 50).toHexString()

const linkBaseStyles = {
  color,
  textDecoration: 'none'
}

const SidebarRoot = styled('div')({
  backgroundColor: ui.dashSidebarBackgroundColor,
  color,
  display: 'flex',
  flexDirection: 'column',
  maxWidth: ui.dashSidebarWidth,
  minWidth: ui.dashSidebarWidth
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

const NavTop = styled('div')({
  // Define (div for flex layout)
})

const NavMain = styled('div')({
  flex: 1,
  overflowY: 'auto'
})

const NavBottom = styled('div')({
  // Define (div for flex layout)
})

const SingleNavItem = styled('div')({
  borderBottom: ui.dashMenuBorder,
  marginBottom: '1rem'
})

const NavLabel = styled('div')({
  color: 'rgba(255, 255, 255, .5)',
  cursor: 'default',
  fontSize: appTheme.typography.s1,
  fontWeight: 600,
  marginLeft: '2.1875rem',
  padding: '1.25rem 0',
  textTransform: 'uppercase'
})

const addTeamStyles = css({
  ...linkBaseStyles,
  alignItems: 'center',
  borderLeft: `${ui.navMenuLeftBorderWidth} solid transparent`,
  cursor: 'pointer',
  display: 'flex',
  margin: '.75rem 0 0',
  opacity: '.65',
  padding: '.625rem .5rem .625rem 2rem',
  position: 'relative',
  transition: `opacity ${ui.transition[0]}`,
  userSelect: 'none',

  ':hover, :focus': {
    ...linkBaseStyles,
    backgroundColor: ui.navMenuDarkBackgroundColorHover,
    opacity: 1
  }
})

const addTeamDisabledStyles = css({
  backgroundColor: ui.navMenuDarkBackgroundColorActive,
  cursor: 'default',
  opacity: 1,

  ':hover, :focus': {
    backgroundColor: ui.navMenuDarkBackgroundColorActive,
    opacity: 1
  }
})

const AddTeamIcon = styled(StyledFontAwesome)({
  fontSize: ui.iconSize,
  height: ui.iconSize,
  lineHeight: ui.iconSize,
  paddingLeft: '.1875rem',
  width: '1.625rem'
})

const AddTeamLabel = styled('div')({
  fontSize: ui.navMenuFontSize,
  lineHeight: ui.navMenuLineHeight
})

const DashSidebar = (props) => {
  const {location, viewer} = props
  return (
    <SidebarRoot>
      <StandardHub location={location} viewer={viewer} />
      <NavBlock>
        <Nav>
          <NavTop>
            <SingleNavItem>
              <DashNavItem location={location} href='/me' icon='table' label='My Dashboard' />
            </SingleNavItem>
            <NavLabel>{'My Teams'}</NavLabel>
          </NavTop>
          <NavMain>
            <DashNavList location={location} viewer={viewer} />
          </NavMain>
          <NavBottom>
            <NavLink
              className={addTeamStyles}
              activeClassName={addTeamDisabledStyles}
              title='Add New Team'
              to='/newteam/1'
            >
              <AddTeamIcon name='plus-circle' />
              <AddTeamLabel>{'Add New Team'}</AddTeamLabel>
            </NavLink>
          </NavBottom>
        </Nav>
      </NavBlock>
      <LogoBlock variant='white' />
    </SidebarRoot>
  )
}

DashSidebar.propTypes = {
  // required to update highlighting
  location: PropTypes.object.isRequired,
  viewer: PropTypes.object
}

export default createFragmentContainer(
  DashSidebar,
  graphql`
    fragment DashSidebar_viewer on User {
      ...StandardHub_viewer
      ...DashNavList_viewer
    }
  `
)
