import React from 'react'
import PrimaryButton from 'universal/components/PrimaryButton'

const PrimaryFloatingActionButton = (props) => (
  <PrimaryButton {...props} className={props.className} elevationHovered={12} elevationResting={6}>
    {props.children}
  </PrimaryButton>
)

export default PrimaryFloatingActionButton
