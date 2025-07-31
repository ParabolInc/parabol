import {CheckBox, CheckBoxOutlineBlank, IndeterminateCheckBox} from '@mui/icons-material'
import type * as React from 'react'
import {cn} from '../ui/cn'

interface Props {
  active: boolean | null
  className?: string
  disabled?: boolean
  onClick?: (e: React.MouseEvent) => void
}
const Checkbox = (props: Props) => {
  const {active, className, disabled, onClick} = props
  const Icon = active ? CheckBox : active === false ? CheckBoxOutlineBlank : IndeterminateCheckBox
  const cursor = disabled ? 'cursor-not-allowed' : 'cursor-pointer'
  const opacity = disabled ? 'opacity-[.38]' : 'opacity-100'

  return (
    <div
      className={cn(
        'text-slate-600',
        'h-6',
        'w-6',
        'block',
        'select-none',
        cursor,
        opacity,
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      <Icon />
    </div>
  )
}

export default Checkbox
