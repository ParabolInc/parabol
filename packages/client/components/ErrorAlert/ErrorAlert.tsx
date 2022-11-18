/**
 * A message container used to alert the user to an error.
 * Looks something like:
 *   [ (!) Your Message Here ]
 *
 */
import styled from '@emotion/styled'
import {Warning} from '@mui/icons-material'
import React from 'react'
import {PALETTE} from '../../styles/paletteV3'
import {Radius} from '../../types/constEnums'

interface Props {
  message: string
}

const ErrorAlertWrapper = styled('div')({
  backgroundColor: PALETTE.TOMATO_100,
  borderRadius: Radius.TOOLTIP,
  display: 'flex',
  alignItems: 'center',
  fontSize: 14,
  marginBottom: 16,
  padding: '8px 16px'
})

const SpacedIcon = styled(Warning)({
  height: 18,
  width: 18,
  marginRight: 8
})

const ErrorAlert = ({message}: Props) => {
  return (
    <ErrorAlertWrapper role='alert'>
      <SpacedIcon />
      <span>{message}</span>
    </ErrorAlertWrapper>
  )
}

export default ErrorAlert
