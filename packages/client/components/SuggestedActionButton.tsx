import {forwardRef, type Ref} from 'react'
import {Button} from '../ui/Button/Button'

interface Props {
  children: string
  onClick?: () => void
}

const SuggestedActionButton = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {children, onClick} = props
  return (
    <Button
      ref={ref}
      variant='primary'
      size='md'
      aria-label={children}
      onClick={onClick}
      className='mb-4 px-4 py-1 text-[14px]'
    >
      {children}
    </Button>
  )
})

export default SuggestedActionButton
