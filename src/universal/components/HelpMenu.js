/**
 * Display a pop-up to show help content per meeting phase.
 *
 * @flow
 */

import React from 'react'
import styled from 'react-emotion'
import LoadableHelpMenu from 'universal/components/LoadableHelpMenu'
import LoadableMenu from 'universal/components/LoadableMenu'
import RaisedButton from 'universal/components/RaisedButton'
import IconLabel from 'universal/components/IconLabel'

type Props = {
  heading?: any,
  content: any
}

const StyledButton = styled(RaisedButton)({
  paddingLeft: 0,
  paddingRight: 0,
  width: '2rem'
})

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
}

const targetAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
}

const HelpMenu = ({heading, content}: Props) => {
  const iconButtonToggle = (
    <StyledButton palette='white' depth={2}>
      <IconLabel icon='question' />
    </StyledButton>
  )

  return (
    <LoadableMenu
      LoadableComponent={LoadableHelpMenu}
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
