/**
 * A presentational button for signing in via a third party.
 *
 * @flow
 */

import type {ThirdPartyAuthProvider} from 'universal/types/auth';

import React from 'react';
import styled from 'react-emotion';

import StyledButton from 'universal/components/StyledButton';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';

import ui from 'universal/styles/ui';

type Props = {
  action: 'Sign in' | 'Sign up',
  waiting?: boolean,
  handleClick: () => void,
  provider: ThirdPartyAuthProvider
};

const ButtonContainer = styled('div')({width: '16rem'});
const StyledIcon = styled(StyledFontAwesome)({
  fontSize: ui.iconSize,
  marginRight: '.5rem'
});
const StyledAuthButton = styled(StyledButton)({
  width: '100%'
});

export default ({action, waiting, provider, handleClick}: Props) => {
  const label = `${action} with ${provider.displayName}`;
  return (
    <ButtonContainer>
      <StyledAuthButton buttonPalette="white" onClick={handleClick} type="button" waiting={waiting}>
        <StyledIcon name={provider.iconName} />
        <div>{label}</div>
      </StyledAuthButton>
    </ButtonContainer>
  );
};
