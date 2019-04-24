import React from 'react'
import styled from 'react-emotion'
import RaisedButton from 'universal/components/RaisedButton'
import IconLabel from 'universal/components/IconLabel'

const StyledButton = styled(RaisedButton)({
  marginLeft: 16, // #gutter
  minWidth: 32,
  paddingLeft: 0,
  paddingRight: 0
})

const AcknowledgeButton = (props) => (
  <StyledButton {...props}>
    <IconLabel icon='check' />
  </StyledButton>
)

export default AcknowledgeButton
