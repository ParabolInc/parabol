import styled from '@emotion/styled'
import {FONT_FAMILY} from '../styles/typographyV2'
import {Radius} from '../types/constEnums'

// TODO: pattern WIP
const FieldBase = styled('div')({
  appearance: 'none',
  border: '1px solid transparent',
  borderRadius: Radius.FIELD,
  boxShadow: 'none',
  display: 'block',
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 14,
  lineHeight: 1.5,
  margin: 0,
  outline: 0,
  padding: '4px 8px',
  width: '100%'
})

export default FieldBase
