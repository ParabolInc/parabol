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

const ButtonContainer = styled('div')({
  paddingTop: '.5rem'
});

export default ({action, waiting, provider, handleClick}: Props) => {
  const label = `${action} with ${provider.displayName}`;
  return (
    <ButtonContainer>
      <Button
        borderRadius="100px"
        type="button"
        title={label}
        label={label}
        icon={provider.iconName}
        iconPlacement="left"
        colorPalette="gray"
        onClick={handleClick}
        waiting={waiting}
      />
    </ButtonContainer>
  );
};
