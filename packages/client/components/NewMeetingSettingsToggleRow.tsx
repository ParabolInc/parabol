import styled from '@emotion/styled'
import type {ReactNode} from 'react'
import {PALETTE} from '../styles/paletteV3'
import Checkbox from './Checkbox'
import PlainButton from './PlainButton/PlainButton'

const ButtonRow = styled(PlainButton)({
  background: PALETTE.SLATE_200,
  borderRadius: '8px',
  display: 'flex',
  fontSize: 14,
  lineHeight: '24px',
  fontWeight: 600,
  userSelect: 'none',
  width: '100%',
  ':hover': {
    backgroundColor: PALETTE.SLATE_300
  },
  padding: '22px 16px',
  alignItems: 'center'
})

const Label = styled('div')({
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: 20,
  fontWeight: 600,
  color: PALETTE.SLATE_900
})

const StyledCheckbox = styled(Checkbox)<{active: boolean}>(({active}) => ({
  '&&': {
    color: active ? PALETTE.SKY_500 : PALETTE.SLATE_700,
    svg: {
      fontSize: 28
    },
    width: 28,
    height: 28,
    textAlign: 'center',
    userSelect: 'none'
  }
}))

interface Props {
  active: boolean
  className?: string
  label: ReactNode
  onClick: () => void
}

const NewMeetingSettingsToggleRow = ({active, className, label, onClick}: Props) => (
  <ButtonRow onClick={onClick} className={className}>
    <Label>{label}</Label>
    <StyledCheckbox active={active} />
  </ButtonRow>
)

export default NewMeetingSettingsToggleRow
