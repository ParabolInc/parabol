// StyledButton.js
// A button styled with react-emotion, TODO: refactor all the button Thangs™
// @flow

import React from 'react'
import styled from 'react-emotion'
import PlainButton from 'universal/components/PlainButton/PlainButton'
import ui from 'universal/styles/ui'

// Passes through any additional props to `PlainButton`, which is just a <button>.
type Props = {
  buttonPalette: string,
  disabled: boolean,
  waiting: boolean
}

const primaryFocusedStyles = {
  backgroundImage: ui.gradientWarmDarkened,
  boxShadow: ui.shadow[1]
}

const whiteFocusedStyles = {
  boxShadow: ui.shadow[1]
}

// Respects the "waiting" prop by disabling the button.
const WaitableButton = (props: Props) => {
  const plainButtonProps = props.waiting ? {...props, disabled: true} : props
  return <PlainButton {...plainButtonProps} />
}

const buttonPaletteOptions = {
  primary: {
    backgroundImage: ui.gradientWarm,
    color: ui.palette.white,
    ':hover': {
      backgroundImage: ui.gradientWarmDarkened,
      boxShadow: ui.shadow[0]
    },
    ':focus': primaryFocusedStyles,
    ':active': primaryFocusedStyles,
    ':disabled': {
      backgroundImage: ui.gradientWarmLightened,
      boxShadow: 'none'
    }
  },
  white: {
    backgroundColor: ui.palette.white,
    color: ui.palette.dark,
    ':hover': {
      boxShadow: ui.shadow[0]
    },
    ':focus': whiteFocusedStyles,
    ':active': whiteFocusedStyles,
    ':disabled': {
      boxShadow: 'none'
    }
  }
}

const StyledButton = styled(WaitableButton)((props: Props) => {
  const {buttonPalette, disabled, waiting} = props
  let cursor
  if (waiting) {
    cursor = 'wait'
  } else if (disabled) {
    cursor = 'not-allowed'
  } else {
    cursor = 'pointer'
  }
  return {
    ...ui.buttonBaseStyles,
    alignItems: 'center',
    cursor,
    display: 'flex',
    justifyContent: 'center',
    padding: '0.75rem 1em',
    ...buttonPaletteOptions[buttonPalette]
  }
})

export default StyledButton
