import styled from '@emotion/styled'
import { PALETTE } from "../styles/paletteV3";

interface StyleProps {
  hasError: boolean
}

const UpgradeCreditCardFormFieldIcon = styled('div')<StyleProps>(({hasError}) => ({
  color: hasError ? PALETTE.TOMATO_500 : PALETTE.SLATE_600,
  display: 'block',
  height: 24,
  width: 24,
  svg: {
    fontSize: 18
  },
  opacity: 0.5,
  paddingLeft: 8,
  textAlign: 'center'
}))

export default UpgradeCreditCardFormFieldIcon
