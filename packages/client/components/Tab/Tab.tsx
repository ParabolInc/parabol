import {forwardRef, ReactNode, Ref} from 'react'
import {cn} from '../../ui/cn'

interface Props {
  className?: string
  isActive?: boolean
  label?: ReactNode
  onClick: () => void
}

const Tab = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {className, isActive, label, onClick} = props
  return (
    <button
      className={cn(
        'flex cursor-default select-none appearance-none items-center justify-center border-0 px-4 py-3 text-sm leading-5 text-grape-600 outline-0',
        isActive ? 'text-grape-700' : 'cursor-pointer',
        className
      )}
      onClick={onClick}
      ref={ref}
    >
      <div className='font-semibold'>{label}</div>
    </button>
  )
})

export default Tab
