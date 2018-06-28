import React from 'react'
import styled from 'react-emotion'
import RaisedButton from 'universal/components/RaisedButton'
import IconLabel from 'universal/components/IconLabel'
import ui from 'universal/styles/ui'

const StyledButton = styled(RaisedButton)({
  marginLeft: ui.rowCompactGutter,
  minWidth: '2rem',
  paddingLeft: 0,
  paddingRight: 0
})

const AcknowledgeButton = (props) => (
  <StyledButton {...props}>
    <IconLabel icon='check' />
  </StyledButton>
)

export default AcknowledgeButton
