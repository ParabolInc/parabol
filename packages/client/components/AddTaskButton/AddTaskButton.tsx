import {type ComponentPropsWithoutRef, forwardRef, type Ref} from 'react'
import {Button} from '../../ui/Button/Button'
import IconLabel from '../IconLabel'

interface Props extends ComponentPropsWithoutRef<'button'> {
  label: string
}

const AddTaskButton = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {label, ...rest} = props
  return (
    <Button
      variant='raised'
      size='sm'
      aria-label={`Add a Task set to ${label}`}
      className='h-6 w-6 border-0 bg-surface-card p-0 text-fg-primary text-sm leading-6'
      ref={ref}
      data-cy={`add-task-${label}`}
      {...rest}
    >
      <IconLabel icon='add' />
    </Button>
  )
})

export default AddTaskButton
