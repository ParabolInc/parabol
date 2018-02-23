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
  action: string, // E.g. "sign in" or "sign up"
  disabled?: boolean,
  handleClick: () => void,
  provider: ThirdPartyAuthProvider
};

const ButtonContainer = styled('div')({
  paddingTop: '.5rem'
});

const capitalize = (str: string): string =>
  `${str.slice(0, 1).toUpperCase()}${str.slice(1)}`;

export default ({action, disabled, provider, handleClick}: Props) => {
  const label = `${capitalize(action)} with ${provider.displayName}`;
  return (
    <ButtonContainer>
      <Button
        type="button"
        title={label}
        label={label}
        icon={provider.iconName}
        iconPlacement="left"
        colorPalette="gray"
        onClick={handleClick}
        disabled={disabled}
      />
    </ButtonContainer>
  );
};
