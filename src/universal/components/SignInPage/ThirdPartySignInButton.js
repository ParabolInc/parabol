/**
 * A presentational button for signing in via a third party.
 *
 * @flow
 */

import React from 'react';

import Button from 'universal/components/Button/Button';

type Props = {
  handleClick: () => void,
  provider: {
    iconName: string,
    displayName: string
  }
};

const buttonWrapperStyles = {
  paddingTop: '.5rem'
};

export default ({provider, handleClick}: Props) => {
  const label = `Sign in with ${provider.displayName}`;
  return (
    <div style={buttonWrapperStyles}>
      <Button
        type="button"
        title={label}
        label={label}
        icon={provider.iconName}
        iconPlacement="left"
        colorPalette="gray"
        onClick={handleClick}
      />
    </div>
  );
};
