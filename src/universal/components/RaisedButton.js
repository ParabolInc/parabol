import React from 'react'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import BaseButton from 'universal/components/BaseButton'

const StyledBaseButton = styled(BaseButton)(({palette = 'gray'}) => {
  const backgroundColor = ui.palette[palette]
  const color = ui.buttonLightThemes.includes(palette) ? ui.palette.dark : ui.palette.white
  return {
    backgroundColor,
    borderRadius: ui.buttonBorderRadius,
    color,
    fontWeight: 600,
    outline: 0
  }
})

const RaisedButton = (props) => {
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

export default RaisedButton
