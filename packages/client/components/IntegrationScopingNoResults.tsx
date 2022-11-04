import styled from '@emotion/styled'
import {Info as InfoIcon, Warning} from '@mui/icons-material'
import React from 'react'
import {PALETTE} from '../styles/paletteV3'

const Message = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px dashed ${PALETTE.SLATE_400}`,
  borderRadius: 4,
  color: PALETTE.SLATE_600,
  fontSize: 14,
  fontStyle: 'italic',
  lineHeight: '32px',
  margin: '64px auto auto',
  padding: '8px 16px'
})

const Info = styled('div')({
  marginRight: 16,
  height: 24,
  width: 24
})

interface Props {
  error?: string | null
  msg?: string | null
}

const IntegrationScopingNoResults = (props: Props) => {
  const {error, msg} = props
  return (
    <Message>
      <Info>{error ? <Warning /> : <InfoIcon />}</Info>
      {error || msg || 'No records found'}
    </Message>
  )
}

export default IntegrationScopingNoResults
