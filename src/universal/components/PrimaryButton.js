import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import BaseButton from 'universal/components/BaseButton'

const PrimaryButton = styled(BaseButton)((props) => {
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

export default PrimaryButton
