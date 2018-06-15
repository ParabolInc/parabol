import React from 'react'
import BaseButton from 'universal/components/BaseButton'
import ui from 'universal/styles/ui'

const defineButtonStyles = (props) => {
  const {buttonPalette, buttonSize, disabled, isBlock, waiting} = props
  const palette = buttonPalette || 'dark'
  const size = buttonSize || 'medium'
  const backgroundColorOnHover = ui.buttonLightThemes.includes(buttonPalette)
    ? 'rgba(0, 0, 0, .15)'
    : ui.palette.light
  const blockStyles = isBlock ? ui.buttonBlockStyles : {}
  const visuallyDisabled = disabled || waiting
  return {
    ...ui.buttonBaseStyles,
    ...ui.buttonSizeStyles[size],
    ...blockStyles,
    backgroundColor: 'transparent',
    color: ui.palette[palette],
    transition: `transform ${ui.buttonTransition}`,
    ':hover,:focus,:active': {
      backgroundColor: !visuallyDisabled && backgroundColorOnHover,
      boxShadow: 'none'
    }
  }
}

const FlatButton = (props) => {
  const {children} = props
  return (
    <BaseButton
      {...props}
      buttonStyles={defineButtonStyles(props)}
      pressedDownStyles={ui.buttonPressedDown}
    >
      {children}
    </BaseButton>
  )
}

export default FlatButton
