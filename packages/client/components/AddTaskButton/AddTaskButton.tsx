import type * as React from 'react'
import {forwardRef, type Ref} from 'react'
import {Button} from '../../ui/Button/Button'
import IconLabel from '../IconLabel'

interface Props {
  label: string
  onClick: (e: React.MouseEvent) => void
  onMouseEnter?: (e: React.MouseEvent) => void
}

const AddTaskButton = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {label, onClick, onMouseEnter} = props
  return (
    <Button
      variant='raised'
      size='sm'
      aria-label={`Add a Task set to ${label}`}
      className='h-6 w-6 border-0 bg-surface-card p-0 text-fg-primary leading-6'
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      ref={ref}
      data-cy={`add-task-${label}`}
    >
      <IconLabel icon='add' />
    </Button>
  )
})

export default AddTaskButton
