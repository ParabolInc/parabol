import React from 'react'
import {ExternalLinks, Breakpoint} from 'types/constEnums'
import {MenuProps} from '../hooks/useMenu'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemWithIcon from './MenuItemWithIcon'
import useBreakpoint from 'hooks/useBreakpoint'

interface Props {
  menuProps: MenuProps
  toggleShortcuts(): void
}

const TopBarHelpMenu = (props: Props) => {
  const {menuProps, toggleShortcuts} = props
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const gotoTeamworkResources = () => {
    window.open(ExternalLinks.RESOURCES, '_blank', 'noreferrer')
  }
  const gotoSupport = () => {
    window.open(ExternalLinks.SUPPORT, '_blank', 'noreferrer')
  }
  return (
    <Menu ariaLabel={'How many we help?'} {...menuProps}>
      <MenuItem
        label={<MenuItemWithIcon label={'Teamwork Resources'} icon={'bookmark'} />}
        onClick={gotoTeamworkResources}
      />
      {isDesktop && (
        <MenuItem
          label={<MenuItemWithIcon label={'Keyboard Shortcuts'} icon={'keyboard'} />}
          onClick={toggleShortcuts}
        />
      )}
      <MenuItem
        label={<MenuItemWithIcon label={'Give Feedback'} icon={'comment '} />}
        onClick={gotoSupport}
      />
    </Menu>
  )
}

export default TopBarHelpMenu
