import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import BaseButton from 'universal/components/BaseButton'

const RaisedButton = styled(BaseButton)(({palette = 'gray'}) => {
  const backgroundColor = ui.palette[palette]
  const color = ui.buttonLightThemes.includes(palette) ? ui.palette.dark : ui.palette.white
  return {
    backgroundColor,
    borderRadius: ui.buttonBorderRadius,
    color,
    fontWeight: 600
  }
})

export default RaisedButton
