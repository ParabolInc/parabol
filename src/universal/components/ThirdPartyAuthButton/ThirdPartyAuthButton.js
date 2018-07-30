/**
 * A presentational button for signing in via a third party.
 *
 * @flow
 */

import type {ThirdPartyAuthProvider} from 'universal/types/auth'
import React from 'react'
import RaisedButton from 'universal/components/RaisedButton'
import IconLabel from 'universal/components/IconLabel'
import {LOGIN_LABEL, SIGNUP_LABEL} from 'universal/utils/constants'

type Props = {
  action: LOGIN_LABEL | SIGNUP_LABEL,
  waiting?: boolean,
  handleClick: () => void,
  provider: ThirdPartyAuthProvider
}

export default ({action, waiting, provider, handleClick}: Props) => {
  const label = `${action} with ${provider.displayName}`
  return (
    <RaisedButton
      size='medium'
      onClick={handleClick}
      palette='white'
      style={{width: '16rem'}}
      waiting={waiting}
    >
      <IconLabel icon={provider.iconName} label={label} />
    </RaisedButton>
  )
}
