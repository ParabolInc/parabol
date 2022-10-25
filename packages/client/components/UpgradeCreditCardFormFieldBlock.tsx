import styled from '@emotion/styled'
import { PALETTE } from "../styles/paletteV3";

interface StyleProps {
  hasError: boolean
}

const UpgradeCreditCardFormFieldBlock = styled('div')<StyleProps>(({hasError}) => ({
  alignItems: 'center',
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: 4,
  display: 'flex',
  input: {
    appearance: 'none',
    backgroundColor: '#FFFFFF',
    border: 0,
    borderRadius: 4,
    boxShadow: 'none',
    color: PALETTE.SLATE_700,
    fontSize: '.9375rem',
    lineHeight: '24px',
    outline: 0,
    padding: '7px 8px', // account for top/bottom border
    width: '100%',
    '::placeholder': {
      color: hasError ? PALETTE.TOMATO_500 : undefined
    }
  }
}))

export default UpgradeCreditCardFormFieldBlock