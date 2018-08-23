import IconLabel from 'universal/components/IconLabel'
import React from 'react'
import styled from 'react-emotion'
import RaisedButton from 'universal/components/RaisedButton'

const StyledButton = styled(RaisedButton)({
  paddingLeft: 0,
  paddingRight: 0,
  width: '2rem'
})

const HelpMenuToggle = (props) => (
  <StyledButton palette='white' depth={2} {...props}>
    <IconLabel icon='question' />
  </StyledButton>
)

export default HelpMenuToggle
