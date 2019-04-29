import React, {forwardRef, Ref} from 'react'
import RaisedButton, {RaisedButtonProps} from 'universal/components/RaisedButton'

interface Props extends RaisedButtonProps {}

const FloatingActionButton = forwardRef((props: Props, ref: Ref<HTMLElement>) => {
  return (
    <RaisedButton
      {...props}
      className={props.className}
      elevationHovered={12}
      elevationResting={6}
      ref={ref}
    >
      {props.children}
    </RaisedButton>
  )
})

export default FloatingActionButton
