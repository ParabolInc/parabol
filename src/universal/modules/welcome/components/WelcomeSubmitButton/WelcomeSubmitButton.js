import React from 'react'
import IconButton from 'universal/components/IconButton'
import styled from 'react-emotion'

const StyledButton = styled(IconButton)({margin: '0 0 0 1rem'})
const ariaLabel = 'Tap to submit and continue'
const WelcomeSubmitButton = (props) => (
  <StyledButton {...props} aria-label={ariaLabel} icon='check-circle' iconLarge palette='warm' />
)

export default WelcomeSubmitButton
