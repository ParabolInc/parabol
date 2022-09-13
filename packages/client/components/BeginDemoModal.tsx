import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import DialogContainer from './DialogContainer'
import Icon from './Icon'
import PrimaryButton from './PrimaryButton'

const StyledDialogContainer = styled(DialogContainer)({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  padding: '24px 16px 32px',
  width: 500
})

const StyledCopy = styled('p')({
  fontSize: 16,
  lineHeight: 1.5,
  margin: '16px 0 24px',
  padding: 0,
  textAlign: 'center'
})

const StyledIcon = styled(Icon)({
  color: PALETTE.SKY_500,
  fontSize: ICON_SIZE.MD48
})

interface Props {
  startDemo: () => void
}

const BeginDemoModal = (props: Props) => {
  const {startDemo} = props

  return (
    <StyledDialogContainer>
      <StyledIcon>chat</StyledIcon>
      <StyledCopy>
        Try Parabol for yourself by holding a 2-minute retrospective meeting with our simulated
        colleagues
      </StyledCopy>
      <PrimaryButton dataCy='start-demo-button' onClick={startDemo} size='medium'>
        Start Demo
      </PrimaryButton>
    </StyledDialogContainer>
  )
}

export default BeginDemoModal
