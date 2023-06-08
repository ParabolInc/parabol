import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '../styles/paletteV3'

const Wrapper = styled('div')({
  padding: '12px 24px',
  margin: 'auto',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  overflow: 'auto'
})

const Message = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 14,
  lineHeight: '20px',
  margin: '24 0'
})

interface Props {
  transcription: string | null
}

const Transcription = (props: Props) => {
  const {transcription} = props

  return (
    <Wrapper>
      <Message>{transcription}</Message>
    </Wrapper>
  )
}

export default Transcription
