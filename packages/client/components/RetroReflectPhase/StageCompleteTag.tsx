import React from 'react'
import {PALETTE} from 'styles/paletteV2'
import styled from '@emotion/styled'

const Wrapper = styled('div')({
  alignItems: 'center',
  background: PALETTE.BACKGROUND_GRAY,
  borderRadius: 4,
  color: '#fff',
  display: 'flex',
  fontWeight: 600,
  fontSize: 14,
  padding: '4px 16px',
  marginBottom: 8,
  maxHeight: 32
})

interface Props {
  isComplete: boolean
}

const StageCompleteTag = (props: Props) => {
  const {isComplete} = props
  if (!isComplete) return null
  return <Wrapper>Stage Completed</Wrapper>
}

export default StageCompleteTag
