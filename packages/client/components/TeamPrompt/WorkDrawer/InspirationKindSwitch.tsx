import {useId} from 'react'
import {cn} from '../../../ui/cn'

interface Props {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

const InspirationKindSwitch = (props: Props) => {
  const {label, checked, onCheckedChange} = props
  const labelId = useId()
  return (
    <div className='flex h-9 items-center justify-between gap-3'>
      <span id={labelId} className='text-fg-primary text-sm'>
        {label}
      </span>
      <button
        type='button'
        role='switch'
        aria-checked={checked}
        aria-labelledby={labelId}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
          checked ? 'bg-accent' : 'bg-hairline-field'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-4 rounded-full bg-white shadow transition-all',
            checked ? 'left-[18px]' : 'left-0.5'
          )}
        />
      </button>
    </div>
  )
}

export default InspirationKindSwitch
