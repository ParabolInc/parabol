/**
 * A presentational button for signing in via a third party.
 *
 * @flow
 */

import React from 'react';
import styled from 'react-emotion';

import Button from 'universal/components/Button/Button';

type Props = {
  handleClick: () => void,
  provider: {
    iconName: string,
    displayName: string
  }
};

const ButtonContainer = styled('div')({
  paddingTop: '.5rem'
});

export default ({provider, handleClick}: Props) => {
  const label = `Sign in with ${provider.displayName}`;
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
      />
    </ButtonContainer>
  );
};
