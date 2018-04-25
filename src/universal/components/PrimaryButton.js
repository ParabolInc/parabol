/**
 * A big warm rounded button.
 *      ____________
 *     ( ~click me~ )
 *      ------------
 * @flow
 */

import React from 'react';
import styled from 'react-emotion';

import PlainButton from 'universal/components/PlainButton/PlainButton';
import ui from 'universal/styles/ui';

// Passes through any additional props to `PlainButton`, which is just a <button>.
type Props = {
  disabled: boolean,
  waiting: boolean
};

const focusedButtonStyles = {
  backgroundImage: ui.gradientWarmDarkened,
  boxShadow: ui.shadow[0]
};

// Respects the "waiting" prop by disabling the button.
const WaitableButton = (props: Props) => {
  const plainButtonProps = props.waiting ? {...props, disabled: true} : props;
  return <PlainButton {...plainButtonProps} />;
};

const PrimaryButton = styled(WaitableButton)((props: Props) => {
  let cursor;
  if (props.waiting) {
    cursor = 'wait';
  } else if (props.disabled) {
    cursor = 'not-allowed';
  } else {
    cursor = 'pointer';
  }
  return {
    ...ui.buttonBaseStyles,
    backgroundImage: ui.gradientWarm,
    color: ui.palette.white,
    cursor,
    padding: '0.75rem 1em',
    ':active': focusedButtonStyles,
    ':focus': focusedButtonStyles,
    ':visited': focusedButtonStyles,
    ':hover': {
      backgroundImage: ui.gradientWarmDarkened
    },
    ':disabled': {
      backgroundImage: ui.gradientWarmLightened
    }
  };
});

export default PrimaryButton;
