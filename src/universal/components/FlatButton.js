import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import BaseButton from 'universal/components/BaseButton'

const FlatButton = styled(BaseButton)((props) => {
  const {palette = 'dark', disabled, waiting} = props
  const backgroundColorOnHover = ui.buttonLightThemes.includes(palette)
    ? 'rgba(0, 0, 0, .15)'
    : ui.palette.light
  const visuallyDisabled = disabled || waiting
  return {
    backgroundColor: 'transparent',
    borderRadius: ui.buttonBorderRadius,
    color: ui.palette[palette],
    outline: 0,
    ':hover,:focus,:active': {
      backgroundColor: !visuallyDisabled && backgroundColorOnHover,
      boxShadow: 'none'
    }
  }
})

export default FlatButton
