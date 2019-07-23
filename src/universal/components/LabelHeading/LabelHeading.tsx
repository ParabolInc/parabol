import styled from '@emotion/styled'
import ui from 'universal/styles/ui'

const LabelHeading = styled('div')({
  color: ui.labelHeadingColor,
  fontSize: ui.labelHeadingFontSize,
  fontWeight: ui.labelHeadingFontWeight,
  letterSpacing: ui.labelHeadingLetterSpacing,
  lineHeight: ui.labelHeadingLineHeight,
  textTransform: 'uppercase',
  userSelect: 'none'
})

export default LabelHeading
