import React from 'react'
import RaisedButton from 'universal/components/RaisedButton'

const FloatingActionButton = (props) => (
  <RaisedButton {...props} className={props.className} elevationHovered={12} elevationResting={6}>
    {props.children}
  </RaisedButton>
)

export default FloatingActionButton
