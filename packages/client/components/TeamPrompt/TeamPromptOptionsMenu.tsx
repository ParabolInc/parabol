import styled from '@emotion/styled'
import React from 'react'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import {PALETTE} from '../../styles/paletteV3'
import {ICON_SIZE} from '~/styles/typographyV2'
import CardButton from '../CardButton'
import Icon from '../Icon'
import IconLabel from '../IconLabel'
import Menu from '../Menu'
import MenuItem from '../MenuItem'
import {MenuItemLabelStyle} from '../MenuItemLabel'

const Options = styled(CardButton)({
  position: 'absolute',
  top: 0,
  right: 0,
  color: PALETTE.SLATE_700,
  height: 32,
  width: 32,
  opacity: 1,
  ':hover': {
    backgroundColor: PALETTE.SLATE_300
  }
})

const StyledIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24,
  marginRight: 8
})

const OptionMenuItem = styled('div')({
  ...MenuItemLabelStyle,
  width: '200px'
})

const TeamPromptOptionsMenu = () => {
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)

  const renderedMenu = (
    <Menu ariaLabel={'Edit the meeting'} {...menuProps}>
      <MenuItem
        key='copy'
        label={
          <OptionMenuItem>
            <StyledIcon>flag</StyledIcon>
            <span>{'End this activity'}</span>
          </OptionMenuItem>
        }
        onClick={async () => {
          menuProps.closePortal()
          // :TODO: (jmtaber129): Actually end meeting.
        }}
      />
    </Menu>
  )

  return (
    <>
      <Options ref={originRef} onClick={togglePortal}>
        <IconLabel ref={originRef} icon='more_vert' />
      </Options>
      {menuPortal(renderedMenu)}
    </>
  )
}

export default TeamPromptOptionsMenu
