import {cn} from 'parabol-client/ui/cn'
import {Select as SelectRoot} from 'parabol-client/ui/Select/Select'
import {SelectContent} from 'parabol-client/ui/Select/SelectContent'
import {SelectItem} from 'parabol-client/ui/Select/SelectItem'
import {SelectTrigger} from 'parabol-client/ui/Select/SelectTrigger'
import {SelectValue} from 'parabol-client/ui/Select/SelectValue'

interface IdName {
  id: string
  name: string
}
export type SelectProps<T extends IdName> = {
  className?: string
  label?: string
  required?: boolean
  options: readonly T[]
  value?: T
  onChange: (value: any) => void
}

const Select = <T extends IdName>(props: SelectProps<T>) => {
  const {label, required, options, value, onChange, className} = props
  return (
    <div className='form-group'>
      {label && (
        <label className='control-label' htmlFor='team'>
          {label}
          {required && <span className='error-text'> *</span>}
        </label>
      )}
      <div className='Input_Wrapper'>
        <SelectRoot
          value={value?.id ?? ''}
          onValueChange={(id) => onChange(options.find((option) => option.id === id) ?? null)}
        >
          <SelectTrigger
            id='team'
            className={cn(
              'h-[38px] w-full rounded-[4px] border-[#cccccc] bg-white px-[8px] text-[14px]',
              className
            )}
          >
            <SelectValue placeholder='Select...' />
          </SelectTrigger>
          <SelectContent className='rounded-[4px] border-[#cccccc] bg-white text-[14px] shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_11px_rgba(0,0,0,0.1)]'>
            {options.map(({id, name}) => (
              <SelectItem key={id} value={id} className='h-[36px] px-[6px] text-[14px]'>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </div>
    </div>
  )
}

export default Select
