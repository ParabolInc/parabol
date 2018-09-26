import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import BaseButton from 'universal/components/BaseButton'

const CardButton = styled(BaseButton)({
  borderRadius: '4em',
  color: ui.palette.dark,
  height: ui.cardButtonHeight,
  lineHeight: ui.cardContentLineHeight,
  minWidth: ui.cardButtonHeight,
  opacity: '.5',
  outline: 0,
  padding: 0,
  ':hover, :focus': {
    backgroundColor: ui.palette.gray,
    opacity: 1
  }
})

export default CardButton
