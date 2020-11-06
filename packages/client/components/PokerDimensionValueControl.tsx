import React from 'react'
import styled from '@emotion/styled'
import MiniPokerCardPlaceholder from './MiniPokerCardPlaceholder'
import MiniPokerCard from './MiniPokerCard'
import {PALETTE} from '~/styles/paletteV2'

const ControlWrap = styled('div')({
  padding: '0 8px'
})

const Control = styled('div')<{hasFocus: boolean}>(({hasFocus}) => ({
  alignItems: 'center',
  backgroundColor: hasFocus ? 'white' : 'rgba(255, 255, 255, .75)',
  border: '2px solid',
  borderColor: hasFocus ? PALETTE.TEXT_BLUE : 'transparent',
  borderRadius: 4,
  cursor: 'pointer',
  display: 'flex',
  padding: 6
}))

const Input = styled('input')({
  background: 'none',
  border: 0,
  color: PALETTE.TEXT_MAIN,
  display: 'block',
  fontSize: 18,
  fontWeight: 600,
  lineHeight: '24px',
  outline: 0,
  textAlign: 'center',
  width: '100%',
  '::placeholder': {
    // color: hasFocus ? 'rgba(125, 125, 125, 125, .25' : 'rgba(125, 125, 125, .5)'
    color: 'rgba(125, 125, 125, .25)'
  }
})

const Label = styled('label')({
  color: PALETTE.TEXT_GRAY,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '24px',
  margin: '0 0 0 16px',
  padding: 0
})

interface Props {
  hasFocus: boolean
  placeholder: string
  scaleValue?: any
}

const PokerDimensionValueControl = (props: Props) => {
  const {hasFocus, placeholder, scaleValue} = props
  return (
    <ControlWrap>
      <Control hasFocus={hasFocus}>
        {scaleValue
          ? <>
            <MiniPokerCard scaleValue={scaleValue} />
            <Label>{'Edit Final Value'}</Label>
          </>
          : <>
            <MiniPokerCardPlaceholder>
              <Input autoFocus={hasFocus} placeholder={placeholder}></Input>
            </MiniPokerCardPlaceholder>
            <Label>{'Enter Final Value'}</Label>
          </>
        }
      </Control>
    </ControlWrap>
  )
}

export default PokerDimensionValueControl
