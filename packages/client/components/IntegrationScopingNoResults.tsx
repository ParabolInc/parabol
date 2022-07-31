import styled from '@emotion/styled'
import InfoIcon from '@mui/icons-material/Info'
import Warning from '@mui/icons-material/Warning'
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
  paddingRight: 16
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
