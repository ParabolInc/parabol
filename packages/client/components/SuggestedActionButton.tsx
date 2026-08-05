import {forwardRef, type Ref} from 'react'
import PrimaryButton from './PrimaryButton'

interface Props {
  children: string
  onClick?: () => void
}

const SuggestedActionButton = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {children, onClick} = props
  return (
    <PrimaryButton
      ref={ref}
      aria-label={children}
      size='medium'
      onClick={onClick}
      className='mb-4 px-4 py-1 text-[14px]'
    >
      {children}
    </PrimaryButton>
  )
})

export default SuggestedActionButton
