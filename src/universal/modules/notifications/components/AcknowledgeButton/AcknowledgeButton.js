import React from 'react'
import RaisedButton from 'universal/components/RaisedButton'
import IconLabel from 'universal/components/IconLabel'

const buttonStyles = {
  paddingLeft: 0,
  paddingRight: 0,
  width: '2rem'
}

const AcknowledgeButton = (props) => (
  <RaisedButton {...props} style={buttonStyles}>
    <IconLabel icon='check' />
  </RaisedButton>
)

export default AcknowledgeButton
