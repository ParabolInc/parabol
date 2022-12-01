import styled from '@emotion/styled'
import {Close} from '@mui/icons-material'
import React from 'react'
import {PALETTE} from '../styles/paletteV3'
import PlainButton from './PlainButton/PlainButton'

const StyledCloseButton = styled(PlainButton)({
  height: 24,
  position: 'absolute',
  right: 16
})

const CloseIcon = styled(Close)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  '&:hover,:focus': {
    color: PALETTE.SLATE_800
  }
})

const Title = styled('div')({
  color: PALETTE.SLATE_800,
  fontSize: 16,
  fontWeight: 600,
  textAlign: 'center'
})

const TopRow = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
})

interface Props {
  closeSpotlight: () => void
}

const SpotlightTopBar = (prop: Props) => {
  const {closeSpotlight} = prop
  return (
    <TopRow>
      <Title>Find cards with similar reflections</Title>
      <StyledCloseButton onClick={closeSpotlight}>
        <CloseIcon />
      </StyledCloseButton>
    </TopRow>
  )
}

export default SpotlightTopBar
