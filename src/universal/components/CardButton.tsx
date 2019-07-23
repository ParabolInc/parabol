import styled from '@emotion/styled'
import ui from 'universal/styles/ui'
import BaseButton from 'universal/components/BaseButton'

const CardButton = styled(BaseButton)({
  alignItems: 'center',
  borderRadius: '4em',
  color: ui.palette.dark,
  display: 'flex',
  height: ui.cardButtonHeight,
  justifyContent: 'center',
  lineHeight: ui.cardContentLineHeight,
  minWidth: ui.cardButtonHeight,
  opacity: .5,
  outline: 0,
  padding: 0,
  ':hover, :focus': {
    backgroundColor: ui.palette.gray,
    opacity: 1
  }
})

export default CardButton
