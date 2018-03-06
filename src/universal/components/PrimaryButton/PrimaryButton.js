/**
 * A big warm rounded button.
 *      ____________
 *     ( ~click me~ )
 *      ------------
 * @flow
 */

import React from 'react';
import styled from 'react-emotion';
import tinycolor from 'tinycolor2';

import PlainButton from 'universal/components/PlainButton/PlainButton';
import appTheme from 'universal/styles/theme/appTheme';

// Passes through any additional props to `PlainButton`, which is just a <button>.
type Props = {
  disabled: boolean,
  waiting: boolean
};

const {orange, purple, rose} = appTheme.brand.new;

const makeGradient = (fromColor: string, toColor: string): string => (
  `linear-gradient(to right, ${fromColor} 0, ${toColor} 100%)`
);

const focusedButtonStyles = {
  backgroundImage: makeGradient(
    tinycolor(orange).darken(3),
    tinycolor(rose).darken(3)
  ),
  boxShadow: `0 0 0 2px ${purple}`,
  outline: 0
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
    backgroundImage: makeGradient(orange, rose),
    borderRadius: '100px',
    fontWeight: 'bold',
    color: 'white',
    cursor,
    padding: '0.85rem 1.5rem',
    ':active': focusedButtonStyles,
    ':focus': focusedButtonStyles,
    ':visited': focusedButtonStyles,
    ':hover': {
      backgroundImage: makeGradient(
        tinycolor(orange).darken(3),
        tinycolor(rose).darken(3)
      )
    },
    ':disabled': {
      backgroundImage: makeGradient(
        tinycolor(orange).desaturate().lighten(),
        tinycolor(rose).desaturate().lighten()
      )
    }
  };
});

export default PrimaryButton;
