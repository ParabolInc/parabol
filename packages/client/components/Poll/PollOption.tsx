import React from 'react'
import {usePollContext} from './PollContext'

interface PollOptionProps {
  as: React.ComponentType<any>
  children: React.ReactNode
  id: string
  disabled?: boolean
}

const PollOption = React.forwardRef((props: PollOptionProps, ref) => {
  const {as: Component, children, id, disabled} = props
  const {onOptionSelected} = usePollContext()

  return (
    <Component ref={ref} key={id} disabled={disabled} onClick={onOptionSelected}>
      {children}
    </Component>
  )
})

export default PollOption
