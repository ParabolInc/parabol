/**
 * A presentational button for signing in via a third party.
 *
 * @flow
 */

import type {ThirdPartyAuthProvider} from 'universal/types/auth'
import React from 'react'
import RaisedButton from 'universal/components/RaisedButton'
import IconLabel from 'universal/components/IconLabel'
import {authButtonWidth} from 'universal/styles/auth'

type Props = {
  waiting?: boolean,
  handleClick: () => void,
  provider: ThirdPartyAuthProvider
}

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
      <IconLabel icon={provider.iconName} label={label} />
    </RaisedButton>
  )
}
