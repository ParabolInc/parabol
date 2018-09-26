import React from 'react'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import BaseButton from 'universal/components/BaseButton'

const StyledBaseButton = styled(BaseButton)((props) => {
  const {disabled, waiting} = props
  const visuallyDisabled = disabled || waiting
  return {
    backgroundImage: visuallyDisabled ? ui.gradientWarmLightened : ui.gradientWarm,
    borderRadius: ui.buttonBorderRadius,
    color: ui.palette.white,
    fontWeight: 600,
    opacity: visuallyDisabled && 1,
    outline: 0,
    ':hover,:focus,:active': {
      backgroundImage: visuallyDisabled ? ui.gradientWarmLightened : ui.gradientWarmDarkened,
      opacity: visuallyDisabled && 1
    }
  }
})

const PrimaryButton = (props) => {
  const {children, className, elevationHovered, elevationResting} = props
  return (
    <StyledBaseButton
      {...props}
      className={className}
      elevationHovered={elevationHovered || 8}
      elevationResting={elevationResting || 2}
    >
      {children}
    </StyledBaseButton>
  )
}

export default PrimaryButton
