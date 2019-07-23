import styled from '@emotion/styled'
import textOverflow from 'universal/styles/helpers/textOverflow'
import ui from 'universal/styles/ui'

const ReflectionFooter = styled('div')({
  ...textOverflow,
  alignItems: 'flex-start',
  background: '#fff',
  borderRadius: ui.cardBorderRadius,
  color: ui.hintColor,
  fontSize: ui.hintFontSize,
  padding: '.5rem .75rem',
  userSelect: 'none'
})

export default ReflectionFooter
