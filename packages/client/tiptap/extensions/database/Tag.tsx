import {cn} from '../../../ui/cn'
import {getColor} from './types'

type Props = {
  label: string
  className?: string
}

export const Tag = (props: Props) => {
  const {label, className} = props
  return (
    <span
      className={cn(
        'inline-flex h-6 min-w-0 max-w-full shrink-0 items-center rounded-sm px-2 font-medium text-xs leading-none',
        getColor(label),
        className
      )}
    >
      <span className='truncate'>{label}</span>
    </span>
  )
}
