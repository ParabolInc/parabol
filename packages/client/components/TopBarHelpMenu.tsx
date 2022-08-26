import React from 'react'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint, ExternalLinks} from '~/types/constEnums'
import {MenuProps} from '../hooks/useMenu'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemWithIcon from './MenuItemWithIcon'

interface Props {
  menuProps: MenuProps
  toggleShortcuts(): void
  dataCy: string
}

const TopBarHelpMenu = (props: Props) => {
  const {menuProps, toggleShortcuts, dataCy} = props
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const gotoSupport = () => {
    window.open(ExternalLinks.SUPPORT, '_blank', 'noreferrer')
  }
  const gotoContact = () => {
    window.open(ExternalLinks.CONTACT, '_blank', 'noreferrer')
  }
  return (
    <Menu ariaLabel={'How may we help?'} {...menuProps}>
      <MenuItem
        label={
          <MenuItemWithIcon dataCy={`${dataCy}`} label={'Documentation'} icon={'bookmark'} />
        }
        onClick={gotoSupport}
      />
      {isDesktop && (
        <MenuItem
          label={
            <MenuItemWithIcon dataCy={`${dataCy}`} label={'Keyboard Shortcuts'} icon={'keyboard'} />
          }
          onClick={toggleShortcuts}
        />
      )}
      <MenuItem
        label={<MenuItemWithIcon dataCy={`${dataCy}`} label={'Get help'} icon={'comment '} />}
        onClick={gotoContact}
      />
    </Menu>
  )
}

export default TopBarHelpMenu
