import styled from '@emotion/styled'
import {Add, Remove} from '@mui/icons-material'
import React from 'react'
import {MeetingSettingsThreshold} from '~/types/constEnums'
import {PALETTE} from '../styles/paletteV3'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  increase(): void
  decrease(): void
  value: number
  'aria-label'?: string
}

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  paddingLeft: 16
})

const Stepper = styled(PlainButton)<{isDisabled: boolean}>(({isDisabled}) => ({
  borderRadius: '100%',
  boxShadow: '0px 1px 1px 1px rgba(0,0,0,0.3)',
  height: 24,
  opacity: isDisabled ? 0.35 : undefined,
  padding: 3,
  width: 24
}))

const RemoveIcon = styled(Remove)({
  width: 18,
  height: 18
})

const AddIcon = styled(Add)({
  width: 18,
  height: 18
})

const Value = styled('span')({
  color: PALETTE.SLATE_800,
  display: 'flex',
  width: 34,
  justifyContent: 'center'
})

const VoteStepper = (props: Props) => {
  const {increase, decrease, value} = props
  const canDecrease = value > 1
  const canIncrease = value < MeetingSettingsThreshold.RETROSPECTIVE_TOTAL_VOTES_MAX

  return (
    <Wrapper>
      <Stepper isDisabled={!canDecrease} aria-label={'Decrease'} onClick={decrease}>
        <RemoveIcon />
      </Stepper>
      <Value aria-label={props['aria-label']}>{value}</Value>
      <Stepper isDisabled={!canIncrease} aria-label={'Increase'} onClick={increase}>
        <AddIcon />
      </Stepper>
    </Wrapper>
  )
}

export default VoteStepper
