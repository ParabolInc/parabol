import IconLabel from 'universal/components/IconLabel'
import React from 'react'
import styled from 'react-emotion'
import FloatingActionButton from 'universal/components/FloatingActionButton'
import {meetingHelpWithBottomBar} from 'universal/styles/meeting'

const StyledButton = styled(FloatingActionButton)(({floatAboveBottomBar}) => ({
  bottom: floatAboveBottomBar ? meetingHelpWithBottomBar : '1.25rem',
  paddingLeft: 0,
  paddingRight: 0,
  position: 'fixed',
  right: '1.25rem',
  width: '2rem',
  zIndex: 200
}))

const HelpMenuToggle = (props) => (
  <StyledButton palette='white' {...props}>
    <IconLabel icon='question' />
  </StyledButton>
)

export default HelpMenuToggle
