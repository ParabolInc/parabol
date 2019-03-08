import React from 'react'
import RaisedButton from 'universal/components/RaisedButton'
import withInnerRef from 'universal/decorators/withInnerRef'

const FloatingActionButton = (props) => {
  return (
    <RaisedButton {...props} className={props.className} elevationHovered={12} elevationResting={6}>
      {props.children}
    </RaisedButton>
  )
}

export default withInnerRef(FloatingActionButton)
