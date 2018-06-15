import React from 'react'
import BaseButton from 'universal/components/BaseButton'
import ui from 'universal/styles/ui'

const defineButtonStyles = (props) => {
  const {buttonPalette, buttonSize, depth, disabled, isBlock, waiting} = props
  const palette = buttonPalette || 'gray'
  const size = buttonSize || 'medium'
  const backgroundColor = ui.palette[palette]
  const color = ui.buttonLightThemes.includes(palette) ? ui.palette.dark : ui.palette.white
  const blockStyles = isBlock ? ui.buttonBlockStyles : {}
  const visuallyDisabled = disabled || waiting
  const hoverDepth = depth || depth === 0 ? ui.shadow[depth + 2] : ui.shadow[1]
  return {
    ...ui.buttonBaseStyles,
    ...ui.buttonSizeStyles[size],
    ...blockStyles,
    backgroundColor,
    boxShadow: ui.shadow[depth] || 'none',
    color,
    fontWeight: 600,
    transition: `box-shadow ${ui.buttonTransition}, transform ${ui.buttonTransition}`,
    ':hover,:focus,:active': {
      boxShadow: !visuallyDisabled && hoverDepth
    }
  }
}

const definePressedDownStyles = ({depth, disabled, waiting}) => {
  const hoverDepth = depth || depth === 0 ? ui.shadow[depth + 1] : ui.shadow[0]
  const visuallyDisabled = disabled || waiting
  const styles = {
    ...ui.buttonPressedDown,
    ':hover,:focus,:active': {boxShadow: !visuallyDisabled && hoverDepth}
  }
  return styles
}

const RaisedButton = (props) => {
  const {children} = props
  return (
    <BaseButton
      {...props}
      buttonStyles={defineButtonStyles(props)}
      pressedDownStyles={definePressedDownStyles(props)}
    >
      {children}
    </BaseButton>
  )
}

export default RaisedButton
