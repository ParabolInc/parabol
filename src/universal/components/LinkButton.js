import React from 'react'
import tinycolor from 'tinycolor2'
import BaseButton from 'universal/components/BaseButton'
import ui from 'universal/styles/ui'

const defineButtonStyles = (props) => {
  const {buttonPalette, buttonSize, disabled, waiting} = props
  const palette = buttonPalette || 'dark'
  const color = ui.palette[palette]
  const hoverColor = tinycolor.mix(color, '#000', 15).toHexString()
  const size = buttonSize || 'medium'
  const visuallyDisabled = disabled || waiting
  return {
    ...ui.buttonBaseStyles,
    ...ui.buttonSizeStyles[size],
    backgroundColor: 'transparent',
    border: 0,
    color,
    padding: 0,
    transition: `transform ${ui.buttonTransition}`,
    ':hover,:focus,:active': {
      boxShadow: 'none',
      color: !visuallyDisabled && hoverColor
    }
  }
}

const LinkButton = (props) => {
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

export default LinkButton
