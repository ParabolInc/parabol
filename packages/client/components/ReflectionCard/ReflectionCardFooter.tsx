import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV2'
import {Gutters} from '../../types/constEnums'

const ReflectionCardFooter = styled('div')({
  color: PALETTE.TEXT_GRAY,
  fontSize: 12,
  lineHeight: '16px',
  padding: `0 ${Gutters.REFLECTION_INNER_GUTTER_HORIZONTAL} ${Gutters.REFLECTION_INNER_GUTTER_VERTICAL}`
})

export default ReflectionCardFooter
