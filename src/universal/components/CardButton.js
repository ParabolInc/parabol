import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import BaseButton from 'universal/components/BaseButton'

const CardButton = styled(BaseButton)({
  borderRadius: ui.borderRadiusSmall,
  color: ui.palette.dark,
  height: ui.cardButtonHeight,
  lineHeight: ui.cardContentLineHeight,
  minWidth: ui.cardButtonHeight,
  opacity: '.5',
  outline: 0,
  padding: 0,
  ':hover, :focus': {
    borderColor: ui.cardButtonBorderColor,
    opacity: 1
  }
})

export default CardButton
