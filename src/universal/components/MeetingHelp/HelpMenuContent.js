import styled from 'react-emotion'
import appTheme from 'universal/styles/theme/appTheme'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import ui from 'universal/styles/ui'
import React from 'react'

const Content = styled('div')({
  fontSize: appTheme.typography.s2,
  lineHeight: '1.5',
  position: 'relative',
  padding: '.75rem 1.25rem',
  width: '15rem'
})

const MenuClose = styled(StyledFontAwesome)({
  color: ui.palette.warm,
  cursor: 'pointer',
  height: ui.iconSize,
  fontSize: ui.iconSize,
  position: 'absolute',
  right: '.25rem',
  top: '-.25rem',
  width: ui.iconSize,
  '&:hover': {
    opacity: '.5'
  }
})

const HelpMenuContent = (props) => {
  const {children, closePortal} = props
  return (
    <Content>
      <MenuClose name='times-circle' onClick={closePortal} title='Close help menu' />
      {children}
    </Content>
  )
}

export default HelpMenuContent
