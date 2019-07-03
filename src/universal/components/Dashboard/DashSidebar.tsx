import {DashSidebar_viewer} from '__generated__/DashSidebar_viewer.graphql'
import React from 'react'
import styled, {css} from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {NavLink} from 'react-router-dom'
import tinycolor from 'tinycolor2'
import DashNavList from 'universal/components/DashNavList/DashNavList'
import Icon from 'universal/components/Icon'
import LogoBlock from 'universal/components/LogoBlock/LogoBlock'
import StandardHub from 'universal/components/StandardHub/StandardHub'
import makeHoverFocus from 'universal/styles/helpers/makeHoverFocus'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import DashNavItem from './DashNavItem'
import {navDrawerShadow} from 'universal/styles/elevation'

export const enum DASH_SIDEBAR {
  WIDTH = 240
}

interface Props {
  location: any
  viewer: DashSidebar_viewer | null
}

const textColor = tinycolor.mix(appTheme.palette.mid10l, '#fff', 50).toHexString()
const linkBaseStyles = {
  color: textColor,
  textDecoration: 'none'
}

const ScrollWrapper = styled('div')({
  boxShadow: navDrawerShadow,
  backgroundColor: ui.dashSidebarBackgroundColor,
  maxWidth: DASH_SIDEBAR.WIDTH,
  minWidth: DASH_SIDEBAR.WIDTH,
  userSelect: 'none'
})

const DashSidebarStyles = styled('div')({
  backgroundColor: ui.dashSidebarBackgroundColor,
  color: textColor,
  display: 'flex',
  flexDirection: 'column',
  maxWidth: DASH_SIDEBAR.WIDTH,
  minWidth: DASH_SIDEBAR.WIDTH,
  overflow: 'hidden',
  height: '100vh'
})

const MyDashboard = styled('div')({
  borderBottom: ui.dashMenuBorder,
  marginBottom: '1rem'
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
  transition: `opacity 100ms ease-in`,
  userSelect: 'none',

  ...makeHoverFocus({
    ...linkBaseStyles,
    backgroundColor: ui.navMenuDarkBackgroundColorHover,
    opacity: 1
  })
})

const disabledAddTeamStyles = css({
  backgroundColor: ui.navMenuDarkBackgroundColorActive,
  cursor: 'default',
  opacity: 1,

  ...makeHoverFocus({
    backgroundColor: ui.navMenuDarkBackgroundColorActive,
    opacity: 1
  })
})

const AddTeamIcon = styled(Icon)({
  fontSize: MD_ICONS_SIZE_18,
  marginRight: '.5rem'
})

const AddTeamLabel = styled('div')({
  fontSize: ui.navMenuFontSize,
  lineHeight: ui.navMenuLineHeight
})

const DashSidebar = (props: Props) => {
  const {location, viewer} = props
  return (
    <ScrollWrapper>
      <DashSidebarStyles>
        <StandardHub location={location} viewer={viewer} />
        <NavBlock>
          <Nav>
            {/* use div for flex layout */}
            <div>
              <MyDashboard>
                <DashNavItem location={location} href='/me' icon='dashboard' label='My Dashboard' />
              </MyDashboard>
              <NavLabel>{'My Teams'}</NavLabel>
            </div>
            <NavMain>
              <DashNavList location={location} viewer={viewer} />
            </NavMain>
            <NavLink
              className={addTeamStyles}
              activeClassName={disabledAddTeamStyles}
              title='Add New Team'
              to='/newteam/1'
            >
              <AddTeamIcon>add_circle</AddTeamIcon>
              <AddTeamLabel>{'Add New Team'}</AddTeamLabel>
            </NavLink>
          </Nav>
        </NavBlock>
        <LogoBlock variant='white' />
      </DashSidebarStyles>
    </ScrollWrapper>
  )
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
