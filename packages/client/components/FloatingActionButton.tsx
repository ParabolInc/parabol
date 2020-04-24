import React, {forwardRef, Ref} from 'react'
import RaisedButton, {RaisedButtonProps} from './RaisedButton'
import {Elevation} from '../styles/elevation'

interface Props extends RaisedButtonProps {}

const FloatingActionButton = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  return (
    <RaisedButton
      {...props}
      className={props.className}
      elevationHovered={Elevation.Z12}
      elevationResting={Elevation.Z6}
      elevationPressed={Elevation.Z9}
      ref={ref}
    >
      {props.children}
    </RaisedButton>
  )
})

export default FloatingActionButton
