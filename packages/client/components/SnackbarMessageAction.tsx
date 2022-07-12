import styled from '@emotion/styled'
import React from 'react'
import {DECELERATE} from '../styles/animation'
import {PALETTE} from '../styles/paletteV3'
import {Radius} from '../types/constEnums'
import PlainButton from './PlainButton/PlainButton'
import {SnackAction} from './Snackbar'

interface Props {
  action: SnackAction | null | undefined
}

const Action = styled(PlainButton)({
  borderRadius: Radius.SNACKBAR,
  color: PALETTE.ROSE_500,
  fontSize: 14,
  fontWeight: 600,
  marginLeft: 8,
  padding: 8,
  transition: `background 100ms ${DECELERATE}`,
  ':hover,:focus,:active': {
    backgroundColor: '#ffffff1a'
  }
})

const SnackbarMessageAction = (props: Props) => {
  const {action} = props
  if (!action) return null
  const {label, callback} = action
  return <Action onClick={callback}>{label}</Action>
}

export default SnackbarMessageAction
