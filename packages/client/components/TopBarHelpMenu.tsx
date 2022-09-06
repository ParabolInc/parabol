import React from 'react'
import {useTranslation} from 'react-i18next'
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

  const {t} = useTranslation()

  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const gotoSupport = () => {
    window.open(ExternalLinks.SUPPORT, '_blank', 'noreferrer')
  }
  const gotoContact = () => {
    window.open(ExternalLinks.CONTACT, '_blank', 'noreferrer')
  }
  return (
    <Menu ariaLabel={t('TopBarHelpMenu.HowMayWeHelp?')} {...menuProps}>
      <MenuItem
        label={
          <MenuItemWithIcon
            dataCy={`${dataCy}`}
            label={t('TopBarHelpMenu.Documentation')}
            icon={t('TopBarHelpMenu.Bookmark')}
          />
        }
        onClick={gotoSupport}
      />
      {isDesktop && (
        <MenuItem
          label={
            <MenuItemWithIcon
              dataCy={`${dataCy}`}
              label={t('TopBarHelpMenu.KeyboardShortcuts')}
              icon={t('TopBarHelpMenu.Keyboard')}
            />
          }
          onClick={toggleShortcuts}
        />
      )}
      <MenuItem
        label={
          <MenuItemWithIcon
            dataCy={`${dataCy}`}
            label={t('TopBarHelpMenu.GetHelp')}
            icon={t('TopBarHelpMenu.Comment')}
          />
        }
        onClick={gotoContact}
      />
    </Menu>
  )
}

export default TopBarHelpMenu
