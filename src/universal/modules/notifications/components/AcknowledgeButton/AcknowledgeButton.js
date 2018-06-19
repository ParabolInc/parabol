import React from 'react'
import styled from 'react-emotion'
import RaisedButton from 'universal/components/RaisedButton'
import IconLabel from 'universal/components/IconLabel'
import ui from 'universal/styles/ui'

const Button = styled(RaisedButton)({
  marginLeft: ui.rowCompactGutter,
  minWidth: '2rem',
  paddingLeft: 0,
  paddingRight: 0
})

const AcknowledgeButton = (props) => (
  <Button {...props}>
    <IconLabel icon='check' />
  </Button>
)

export default AcknowledgeButton
