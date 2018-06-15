import React from 'react'
import BaseButton from 'universal/components/BaseButton'
import ui from 'universal/styles/ui'

const defineButtonStyles = (props) => {
  const {buttonSize, depth, disabled, isBlock, waiting} = props
  const size = buttonSize || 'medium'
  const blockStyles = isBlock ? ui.buttonBlockStyles : {}
  const visuallyDisabled = disabled || waiting
  const hoverDepth = depth || depth === 0 ? ui.shadow[depth + 2] : ui.shadow[1]
  return {
    ...ui.buttonBaseStyles,
    ...ui.buttonSizeStyles[size],
    ...blockStyles,
    backgroundImage: ui.gradientWarm,
    color: ui.palette.white,
    fontWeight: 600,
    transition: `box-shadow ${ui.buttonTransition}, transform ${ui.buttonTransition}`,
    ':hover,:focus,:active': {
      backgroundColor: visuallyDisabled ? ui.gradientWarmLightened : ui.gradientWarmLightened,
      boxShadow: !visuallyDisabled && hoverDepth,
      opacity: visuallyDisabled && 1
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

const PrimaryButton = (props) => {
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

export default PrimaryButton
