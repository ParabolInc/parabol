/**
 * A presentational button for signing in via a third party.
 *
 * @flow
 */

import React from 'react';

import Button from 'universal/components/Button/Button';

type Props = {
  provider: {
    iconSrc?: string,
    displayName: string
  }
};

const buttonWrapperStyles = {
  paddingTop: '.5rem'
};

export default ({provider}: Props) => {
  const label = `Sign in with ${provider.displayName}`;
  return (
    <div style={buttonWrapperStyles}>
      <Button
        type="button"
        title={label}
        label={label}
        icon={provider.iconSrc}
        iconPlacement="left"
        colorPalette="gray"
      />
    </div>
  );
};
