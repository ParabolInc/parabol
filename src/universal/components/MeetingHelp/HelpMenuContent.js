import styled from '@emotion/styled'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import React from 'react'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'

const Content = styled('div')({
  fontSize: appTheme.typography.s2,
  lineHeight: '1.5',
  position: 'relative',
  padding: '.75rem 1rem',
  width: '17rem'
})

const MenuClose = styled(Icon)({
  color: ui.palette.midGray,
  cursor: 'pointer',
  fontSize: MD_ICONS_SIZE_18,
  position: 'absolute',
  right: '.25rem',
  top: '-.25rem',
  '&:hover': {
    opacity: '.5'
  }
})

const HelpMenuContent = (props) => {
  const {children, closePortal} = props
  return (
    <Content>
      <MenuClose onClick={closePortal} title='Close help menu'>
        close
      </MenuClose>
      {children}
    </Content>
  )
}

export default HelpMenuContent
