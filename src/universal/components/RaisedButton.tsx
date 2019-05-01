import React, {forwardRef} from 'react'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import BaseButton, {BaseButtonProps} from 'universal/components/BaseButton'

const StyledBaseButton = styled(BaseButton)(({palette = 'gray'}: {palette?: string}) => {
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

export interface RaisedButtonProps extends BaseButtonProps {
  palette?: string
}

const RaisedButton = forwardRef((props: RaisedButtonProps, ref: any) => {
  const {children, className, elevationHovered, elevationResting} = props
  return (
    <StyledBaseButton
      {...props}
      className={className}
      elevationHovered={elevationHovered || 8}
      elevationResting={elevationResting || 2}
      innerRef={ref}
    >
      {children}
    </StyledBaseButton>
  )
})

export default RaisedButton
