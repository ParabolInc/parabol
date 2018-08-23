import IconLabel from 'universal/components/IconLabel'
import React from 'react'
import styled from 'react-emotion'
import RaisedButton from 'universal/components/RaisedButton'
import {meetingHelpWithBottomBar} from 'universal/styles/meeting'

const StyledButton = styled(RaisedButton)(({isFacilitating}) => ({
  bottom: isFacilitating ? meetingHelpWithBottomBar : '1.25rem',
  paddingLeft: 0,
  paddingRight: 0,
  position: 'fixed',
  right: '1.25rem',
  width: '2rem',
  zIndex: 200
}))

const HelpMenuToggle = (props) => (
  <StyledButton palette='white' depth={2} {...props}>
    <IconLabel icon='question' />
  </StyledButton>
)

export default HelpMenuToggle
