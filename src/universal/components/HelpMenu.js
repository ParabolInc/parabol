/**
 * Display a pop-up to show help content per meeting phase.
 *
 * @flow
 */

import React from 'react'
import styled from 'react-emotion'
import LoadableMenu from 'universal/components/LoadableMenu'
import RaisedButton from 'universal/components/RaisedButton'
import IconLabel from 'universal/components/IconLabel'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'

type Props = {
  heading?: any,
  content: any
}

const StyledButton = styled(RaisedButton)({
  paddingLeft: 0,
  paddingRight: 0,
  width: '2rem'
})

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

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
}

const targetAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
}

// this is not a loadable component,
// but LoadableMenu can handle it conditionally via withToggledPortal.js
const HelpMenuContent = (props) => {
  const {closePortal, heading, content} = props

  return (
    <MenuContent>
      <MenuClose name='times-circle' onClick={closePortal} title='Close help menu' />
      {heading && <h3>{heading}</h3>}
      {content}
    </MenuContent>
  )
}

const HelpMenu = ({heading, content}: Props) => {
  const iconButtonToggle = (
    <StyledButton palette='white' depth={2}>
      <IconLabel icon='question' />
    </StyledButton>
  )

  return (
    <LoadableMenu
      LoadableComponent={HelpMenuContent}
      maxWidth={280}
      maxHeight={320}
      originAnchor={originAnchor}
      queryVars={{heading, content}}
      targetAnchor={targetAnchor}
      toggle={iconButtonToggle}
    />
  )
}

export default HelpMenu
