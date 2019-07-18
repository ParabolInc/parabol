import React from 'react'
import {SnackAction} from 'universal/components/Snackbar'
import styled from 'react-emotion'
import PlainButton from 'universal/components/PlainButton/PlainButton'
import {PALETTE} from 'universal/styles/paletteV2'
import {DECELERATE} from 'universal/styles/animation'

interface Props {
  action: SnackAction | null | undefined
}

const Action = styled(PlainButton)({
  borderRadius: 4,
  color: PALETTE.TEXT_PINK,
  padding: 8,
  transition: `background 100ms ${DECELERATE}`,
  ':hover,:focus,:active': {
    backgroundColor: '#ffffff0e'
  }
})

const SnackbarMessageAction = (props: Props) => {
  const {action} = props
  if (!action) return null
  const {label, callback} = action
  return <Action onClick={callback}>{label}</Action>
}

export default SnackbarMessageAction
