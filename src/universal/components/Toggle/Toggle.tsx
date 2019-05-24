import React from 'react'
import styled from 'react-emotion'
import {PALETTE} from 'universal/styles/paletteV2'
import {DECELERATE} from 'universal/styles/animation'
import {switchShadow} from 'universal/styles/elevation'

interface Props {
  active: boolean
  disabled?: boolean
  onClick: (e: React.MouseEvent) => void
}

const UNDERLAY_WIDTH = 56
const KNOB_SIZE = 24

const Underlay = styled('div')(
  ({active, disabled}: {active: boolean; disabled: boolean | undefined}) => ({
    backgroundColor: active ? PALETTE.BACKGROUND.GREEN : PALETTE.BACKGROUND.MAIN_DARKENED,
    borderRadius: 16,
    color: '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'block',
    height: KNOB_SIZE + 4,
    minWidth: UNDERLAY_WIDTH,
    opacity: disabled ? 0.5 : 1,
    position: 'relative',
    transition: `all 150ms ${DECELERATE}`,
    userSelect: 'none',
    width: UNDERLAY_WIDTH
  })
)

const ToggleKnob = styled('div')(({active}: {active: boolean}) => ({
  backgroundColor: '#fff',
  borderRadius: '100%',
  boxShadow: switchShadow,
  display: 'block',
  height: KNOB_SIZE,
  position: 'absolute',
  top: 2,
  transition: `transform 150ms ${DECELERATE}`,
  transform: `translateX(${active ? UNDERLAY_WIDTH - KNOB_SIZE - 4 : 4}px)`,
  width: KNOB_SIZE
}))

const Toggle = (props: Props) => {
  const {active, disabled, onClick} = props

  return (
    <Underlay active={active} disabled={disabled} onClick={disabled ? undefined : onClick}>
      <ToggleKnob active={active} />
    </Underlay>
  )
}

export default Toggle
