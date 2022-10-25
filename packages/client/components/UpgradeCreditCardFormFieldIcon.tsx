import styled from '@emotion/styled'
import Icon from "./Icon";
import { PALETTE } from "../styles/paletteV3";
import { ICON_SIZE } from "../styles/typographyV2";

interface StyleProps {
  hasError: boolean
}

const UpgradeCreditCardFormFieldIcon = styled(Icon)<StyleProps>(({hasError}) => ({
  color: hasError ? PALETTE.TOMATO_500 : PALETTE.SLATE_600,
  display: 'block',
  fontSize: ICON_SIZE.MD18,
  opacity: 0.5,
  paddingLeft: 8,
  textAlign: 'center'
}))

export default UpgradeCreditCardFormFieldIcon