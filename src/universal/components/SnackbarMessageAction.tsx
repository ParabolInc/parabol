import React from 'react'
import {SnackAction} from 'universal/components/Snackbar'
import styled from '@emotion/styled'
import PlainButton from 'universal/components/PlainButton/PlainButton'
import {PALETTE} from 'universal/styles/paletteV2'
import {DECELERATE} from 'universal/styles/animation'

interface Props {
  action: SnackAction | null | undefined
}

const Action = styled(PlainButton)({
  borderRadius: 2,
  color: PALETTE.TEXT_PINK,
  fontSize: 14,
  fontWeight: 600,
  marginLeft: 8,
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
