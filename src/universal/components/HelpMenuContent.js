// @flow
import React from 'react'
import styled from 'react-emotion'
import FontAwesome from 'react-fontawesome'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'

type Props = {
  closePortal: () => void,
  heading?: any,
  content: any
}

const MenuContent = styled('div')({
  fontSize: appTheme.typography.s2,
  lineHeight: '1.5',
  position: 'relative',
  padding: '.75rem 1.25rem',
  width: '15rem',
  '& h3': {
    fontSize: '1em',
    fontWeight: 600,
    margin: '0 0 1em'
  },
  '& p': {
    margin: '0 0 1em'
  },
  '& a': {
    textDecoration: 'underline'
  }
})

const MenuClose = styled(FontAwesome)({
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

const HelpMenuContent = (props: Props) => {
  const {closePortal, heading, content} = props

  return (
    <MenuContent>
      <MenuClose name='times-circle' onClick={closePortal} title='Close help menu' />
      {heading && <h3>{heading}</h3>}
      {content}
    </MenuContent>
  )
}

export default HelpMenuContent
