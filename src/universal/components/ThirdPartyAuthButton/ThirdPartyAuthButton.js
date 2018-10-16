/**
 * A presentational button for signing in via a third party.
 *
 * @flow
 */

import type {ThirdPartyAuthProvider} from 'universal/types/auth'
import React from 'react'
import RaisedButton from 'universal/components/RaisedButton'
import {authButtonWidth} from 'universal/styles/auth'
import styled from 'react-emotion'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import {ICON_SIZE_FA_1X} from 'universal/styles/icons'

type Props = {
  waiting?: boolean,
  handleClick: () => void,
  provider: ThirdPartyAuthProvider
}

const StyledIcon = styled(StyledFontAwesome)({
  display: 'block',
  color: 'inherit',
  fontSize: ICON_SIZE_FA_1X,
  marginRight: '.5rem'
})

const Label = styled('div')({
  color: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  whiteSpace: 'nowrap'
})

export default ({waiting, provider, handleClick}: Props) => {
  const label = `Sign in with ${provider.displayName}`
  return (
    <RaisedButton
      size='medium'
      onClick={handleClick}
      palette='white'
      style={{width: authButtonWidth}}
      waiting={waiting}
    >
      <StyledIcon name={provider.iconName} />
      <Label>{label}</Label>
    </RaisedButton>
  )
}
