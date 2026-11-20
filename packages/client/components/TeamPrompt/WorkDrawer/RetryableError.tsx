import {Button} from '../../../ui/Button/Button'
import {cn} from '../../../ui/cn'

interface Props {
  message: string
  onRetry: () => void
  className?: string
}

const RetryableError = (props: Props) => {
  const {message, onRetry, className} = props
  return (
    <div role='alert' className={cn('flex items-center justify-between gap-2', className)}>
      <span className='text-fg-error text-sm'>{message}</span>
      <Button variant='outline' size='sm' className='shrink-0' onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}

export default RetryableError
