import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '../styles/paletteV2'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  field: 'totalVotes' | 'maxVotesPerGroup'
  value: number
}

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  paddingLeft: 16
})

const Stepper = styled(PlainButton)({
  borderRadius: '100%',
  boxShadow: '0px 1px 1px 1px rgba(0,0,0,0.3)',
  height: 24
})

const Value = styled('span')({
  color: PALETTE.TEXT_MAIN_DARK,
  padding: '0 8px'
})

const MAX_VOTES = 12
const VoteStepper = (props: Props) => {
  const {field, value} = props
  const canDecrease = value > 1
  const canIncrease = value < MAX_VOTES

  const decrease = () => {
    const nextValue = value - 1
    if (nextValue < 1) return
    console.log('field', field)
  }

  return (
    <Wrapper>
      <Stepper isDisabled={!canDecrease} onClick={decrease}>
        <Icon>remove</Icon>
      </Stepper>
      <Value>{value}</Value>
      <Stepper isDisabled={!canIncrease} onClick={decrease}>
        <Icon>add</Icon>
      </Stepper>
    </Wrapper>
  )
}

export default VoteStepper
