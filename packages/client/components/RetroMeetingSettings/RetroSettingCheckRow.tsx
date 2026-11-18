import {useId} from 'react'
import {Checkbox} from '../../ui/Checkbox/Checkbox'
import {cn} from '../../ui/cn'

interface Props {
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
}

const RetroSettingCheckRow = (props: Props) => {
  const {label, description, checked, disabled, onCheckedChange, className} = props
  const id = useId()
  return (
    <div className={cn('flex items-start gap-3 px-1 py-3', className)}>
      <label htmlFor={id} className='flex flex-1 cursor-pointer flex-col gap-0.5'>
        <span className='font-semibold text-fg-primary text-sm'>{label}</span>
        <span className='text-[13px] text-fg-secondary leading-[18px]'>{description}</span>
      </label>
      <Checkbox
        id={id}
        className='mt-0.5 shrink-0'
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
    </div>
  )
}

export default RetroSettingCheckRow
