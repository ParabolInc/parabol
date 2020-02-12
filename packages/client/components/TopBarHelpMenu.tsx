import React from 'react'
import {ExternalLinks, Breakpoint} from 'types/constEnums'
import {MenuProps} from '../hooks/useMenu'
import Menu from './Menu'
import MenuItem from './MenuItem'
import TopBarHelpMenuItem from './TopBarHelpMenuItem'
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
        label={<TopBarHelpMenuItem label={'Teamwork Resources'} icon={'bookmark'} />}
        onClick={gotoTeamworkResources}
      />
      {isDesktop && (
        <MenuItem
          label={<TopBarHelpMenuItem label={'Keyboard Shortcuts'} icon={'keyboard'} />}
          onClick={toggleShortcuts}
        />
      )}
      <MenuItem
        label={<TopBarHelpMenuItem label={'Give Feedback'} icon={'comment '} />}
        onClick={gotoSupport}
      />
    </Menu>
  )
}

export default TopBarHelpMenu
