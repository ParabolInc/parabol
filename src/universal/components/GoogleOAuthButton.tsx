import React from 'react'
import styled from 'react-emotion'
import PrimaryButton from 'universal/components/PrimaryButton'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import {ICON_SIZE_FA_1X} from 'universal/styles/icons'

const WideButton = styled(PrimaryButton)({
  width: '15rem'
})

const StyledIcon = styled(StyledFontAwesome)({
  display: 'block',
  color: 'inherit',
  fontSize: ICON_SIZE_FA_1X,
  marginRight: '.5rem'
})

interface Props {
  label: string
  onClick: () => void
  waiting: boolean | undefined
}

function GoogleOAuthButton (props: Props) {
  const {onClick, label, waiting} = props
  return (
    <WideButton size='medium' onClick={onClick} waiting={waiting}>
      <StyledIcon name='google' />
      <span>{label}</span>
    </WideButton>
  )
}

export default GoogleOAuthButton
