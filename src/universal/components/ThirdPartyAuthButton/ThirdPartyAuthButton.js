/**
 * A presentational button for signing in via a third party.
 *
 * @flow
 */

import type {ThirdPartyAuthProvider} from 'universal/types/auth';

import React from 'react';
import styled from 'react-emotion';

import Button from 'universal/components/Button/Button';

type Props = {
  action: 'Sign in' | 'Sign up',
  waiting?: boolean,
  handleClick: () => void,
  provider: ThirdPartyAuthProvider
};

const ButtonContainer = styled('div')({width: '16rem'});

export default ({action, waiting, provider, handleClick}: Props) => {
  const label = `${action} with ${provider.displayName}`;
  return (
    <ButtonContainer>
      <Button
        buttonSize="medium"
        colorPalette="white"
        icon={provider.iconName}
        isBlock
        label={label}
        onClick={handleClick}
        title={label}
        type="button"
        waiting={waiting}
      />
    </ButtonContainer>
  );
};
