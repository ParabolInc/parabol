import type * as React from 'react'
import {forwardRef, type Ref} from 'react'
import IconLabel from '../IconLabel'
import RaisedButton from '../RaisedButton'

interface Props {
  label: string
  onClick: (e: React.MouseEvent) => void
  onMouseEnter?: (e: React.MouseEvent) => void
}

const AddTaskButton = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {label, onClick, onMouseEnter} = props
  return (
    <RaisedButton
      aria-label={`Add a Task set to ${label}`}
      className='h-6 w-6 border-0 bg-surface-card p-0 text-fg-primary leading-6'
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      palette='white'
      ref={ref}
      dataCy={`add-task-${label}`}
    >
      <IconLabel icon='add' />
    </RaisedButton>
  )
})

export default AddTaskButton
